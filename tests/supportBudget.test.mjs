// Local-only native PostgreSQL, never reads .env.local or connects to Supabase.
// Setup: npm install --prefix .tmp-support --no-save embedded-postgres@18.4.0-beta.17
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

test('Native PostgreSQL budget: permissions, atomic parallel limits, UTC resets and failure', async () => {
  const { default: EmbeddedPostgres } = await import(pathToFileURL(resolve('.tmp-support/node_modules/embedded-postgres/dist/index.js')));
  const root = await realpath('.tmp-support');
  const dir = await mkdtemp(resolve(root, 'db-test-'));
  const pg = new EmbeddedPostgres({ databaseDir: dir, port: 55439, user: 'postgres', password: randomUUID(), persistent: true, postgresFlags: ['-c', 'listen_addresses=127.0.0.1', '-c', 'max_connections=80'], onLog: () => {}, onError: () => {} });
  const clients = [];
  async function connect(role) { const client = pg.getPgClient(); await client.connect(); clients.push(client); if (role) await client.query(`set role ${role}`); return client; }
  let started = false;
  try {
    await pg.initialise(); await pg.start(); started = true;
    const admin = await connect();
    await admin.query('create role anon; create role authenticated; create role unrelated; create role service_role bypassrls; create table public.existing_case_sentinel(id int); insert into public.existing_case_sentinel values(1)');
    await admin.query(await readFile('supabase/migrations/20261018112420_support_request_budget.sql', 'utf8'));
    const owner = await admin.query("select p.prosecdef, p.proconfig, r.rolname from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid='public.consume_support_budget(integer,integer)'::regprocedure");
    assert.equal(owner.rows[0].prosecdef, false); assert.equal(owner.rows[0].rolname, 'postgres'); assert.ok(owner.rows[0].proconfig.includes('search_path=pg_catalog'));
    const privateOwner = await admin.query("select p.prosecdef, p.proconfig, r.rolname from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid='fixlens_support_private.consume_support_budget(integer,integer)'::regprocedure");
    assert.equal(privateOwner.rows[0].prosecdef, true); assert.equal(privateOwner.rows[0].rolname, 'postgres'); assert.ok(privateOwner.rows[0].proconfig.includes('search_path=pg_catalog'));
    for (const role of ['anon', 'authenticated', 'unrelated']) {
      const client = await connect(role);
      await assert.rejects(client.query('select public.consume_support_budget()'), e => e.code === '42501');
      await assert.rejects(client.query('select fixlens_support_private.consume_support_budget(30,300)'), e => e.code === '42501');
      await assert.rejects(client.query('select * from fixlens_support_private.request_budget'), e => e.code === '42501');
      await assert.rejects(client.query('update fixlens_support_private.request_budget set day_count=0'), e => e.code === '42501');
      const privileges = await admin.query("select has_function_privilege($1, 'public.consume_support_budget(integer,integer)', 'EXECUTE') as wrapper, has_function_privilege($1, 'fixlens_support_private.consume_support_budget(integer,integer)', 'EXECUTE') as private, has_schema_privilege($1,'fixlens_support_private','USAGE') as usage", [role]);
      assert.deepEqual(privileges.rows[0], {wrapper:false,private:false,usage:false});
    }
    const server = await connect('service_role');
    await assert.rejects(server.query('select * from fixlens_support_private.request_budget'), e => e.code === '42501');
    await assert.rejects(server.query('update fixlens_support_private.request_budget set day_count=0'), e => e.code === '42501');
    await assert.rejects(server.query('delete from fixlens_support_private.request_budget'), e => e.code === '42501');
    await assert.rejects(server.query('create table fixlens_support_private.forbidden(id int)'), e => e.code === '42501');
    const minimum = await admin.query("select has_schema_privilege('service_role','fixlens_support_private','USAGE') as usage, has_schema_privilege('service_role','fixlens_support_private','CREATE') as create, has_function_privilege('service_role','public.consume_support_budget(integer,integer)','EXECUTE') as wrapper, has_function_privilege('service_role','fixlens_support_private.consume_support_budget(integer,integer)','EXECUTE') as private");
    assert.deepEqual(minimum.rows[0], {usage:true,create:false,wrapper:true,private:true});
    await assert.rejects(server.query('select public.consume_support_budget(0,300)'), e => e.code === '22023');
    await assert.rejects(server.query('select public.consume_support_budget(30,3001)'), e => e.code === '22023');
    const consume = async (client, minute=30, day=300) => (await client.query('select public.consume_support_budget($1,$2) as result', [minute, day])).rows[0].result;
    const reset = () => admin.query("update fixlens_support_private.request_budget set minute_start='-infinity',day_start='-infinity',minute_count=0,day_count=0");
    // An accidental wrapper grant cannot cross the private schema/function boundary.
    await admin.query('grant execute on function public.consume_support_budget(integer,integer) to anon');
    await assert.rejects(clients[1].query('select public.consume_support_budget()'), e => e.code === '42501');
    await admin.query('revoke execute on function public.consume_support_budget(integer,integer) from anon');
    // Even accidental grants on BOTH functions/schema do not bypass the private role guard.
    await admin.query('grant usage on schema fixlens_support_private to anon; grant execute on function public.consume_support_budget(integer,integer), fixlens_support_private.consume_support_budget(integer,integer) to anon');
    await assert.rejects(clients[1].query('select public.consume_support_budget()'), e => e.code === '42501');
    await assert.rejects(clients[1].query('select fixlens_support_private.consume_support_budget(30,300)'), e => e.code === '42501');
    await admin.query('revoke execute on function public.consume_support_budget(integer,integer), fixlens_support_private.consume_support_budget(integer,integer) from anon; revoke usage on schema fixlens_support_private from anon');
    // Independent native PG connections, not serialized WASM clients.
    const parallel = await Promise.all(Array.from({ length: 40 }, () => connect('service_role')));
    await reset();
    const outcomes = await Promise.all(parallel.map(client => consume(client)));
    assert.equal(outcomes.filter(r => r.allowed).length, 30); assert.equal(outcomes.filter(r => !r.allowed).length, 10);
    assert.ok(outcomes.filter(r => !r.allowed).every(r => r.retry_after >= 1 && r.retry_after <= 60));
    let row = (await admin.query('select * from fixlens_support_private.request_budget')).rows[0];
    assert.equal(row.day_count, 30); assert.equal(row.minute_count, 30);
    await admin.query("update fixlens_support_private.request_budget set minute_start='-infinity',day_count=299");
    assert.equal((await consume(server)).allowed, true);
    assert.equal((await consume(server)).allowed, false);
    // UTC date, independent of connection timezone; day cap stays after minute reset.
    await admin.query("update fixlens_support_private.request_budget set minute_start='-infinity',day_count=300");
    await server.query("set timezone='Australia/Sydney'");
    assert.equal((await consume(server)).allowed, false);
    row = (await admin.query('select * from fixlens_support_private.request_budget')).rows[0]; assert.equal(row.day_count, 300); assert.equal(row.minute_count, 0);
    await admin.query("update fixlens_support_private.request_budget set day_start=day_start-interval '1 day'");
    assert.equal((await consume(server)).allowed, true);
    const utc = await admin.query("select day_start = date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC' as aligned, day_count, minute_count from fixlens_support_private.request_budget");
    assert.equal(utc.rows[0].aligned, true); assert.equal(utc.rows[0].day_count, 1);
    await admin.query("update fixlens_support_private.request_budget set minute_start=minute_start-interval '1 minute',minute_count=30");
    assert.equal((await consume(server)).allowed, true);
    assert.equal((await admin.query('select day_count from fixlens_support_private.request_budget')).rows[0].day_count, 2);
    // Invoker search_path cannot redirect the definer's relation lookup.
    await server.query("set search_path = pg_temp, public");
    assert.equal((await consume(server)).allowed, true);
    // Smaller configured limits enforce the exact boundary and don't charge denied calls.
    await reset(); assert.equal((await consume(server, 1, 2)).allowed, true); assert.equal((await consume(server, 1, 2)).allowed, false);
    await admin.query("update fixlens_support_private.request_budget set minute_start='-infinity'");
    assert.equal((await consume(server, 1, 2)).allowed, true);
    await admin.query("update fixlens_support_private.request_budget set minute_start='-infinity'");
    assert.equal((await consume(server, 1, 2)).allowed, false);
    // Held lock fails within the function's bound. No provider runs inside this SQL operation.
    await admin.query('begin; select * from fixlens_support_private.request_budget for update');
    await assert.rejects(consume(server), e => e.code === '55P03');
    await admin.query('rollback');
    await admin.query('delete from fixlens_support_private.request_budget');
    await assert.rejects(consume(server), e => e.code === 'P0002');
    assert.equal((await admin.query('select count(*)::int as n from public.existing_case_sentinel')).rows[0].n, 1);
    // Exact rollback, no cascade or existing schema changes.
    await admin.query(await readFile('supabase/maintenance/rollback_support_request_budget.sql', 'utf8'));
    assert.equal((await admin.query('select count(*)::int as n from public.existing_case_sentinel')).rows[0].n, 1);
  } finally {
    await Promise.allSettled(clients.map(client => client.end()));
    if (started) await pg.stop();
    const target = await realpath(dir);
    if (!target.startsWith(root + sep)) throw new Error('Unsafe local test cleanup');
    await rm(target, { recursive: true, force: true });
  }
});
