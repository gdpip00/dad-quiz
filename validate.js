const assert = require('node:assert/strict')
const fs = require('node:fs')

function validate(bank) {
  assert.match(bank.version, /^\d+\.\d+\.\d+$/)
  assert.ok(['draft','published'].includes(bank.status))
  assert.ok(Array.isArray(bank.questions) && bank.questions.length)
  const ids = new Set()
  for (const q of bank.questions) {
    assert.match(q.id, /^[a-z0-9-]{1,64}$/)
    assert.ok(!ids.has(q.id), '重复题目 '+q.id)
    ids.add(q.id)
    for (const field of ['title','scenario','focus','stage','category']) {
      assert.ok(typeof q[field]==='string' && q[field].trim(), q.id+' 缺少 '+field)
    }
    assert.ok(['pregnancy','baby','postpartum'].includes(q.topic))
    assert.ok(Number.isInteger(q.revision) && q.revision>0)
    assert.deepEqual(q.options.map(option=>option.key), ['A','B','C','D'])
    assert.ok(q.options.some(option=>option.key===q.best))
    for (const option of q.options) {
      assert.ok(option.text.trim() && q.explanations[option.key]?.trim())
    }
    assert.ok(Array.isArray(q.tags) && q.tags.length && q.tags.every(tag=>typeof tag==='string' && tag.trim()))
    assert.ok(q.sources.length)
    for (const source of q.sources) {
      assert.ok(source.id && source.publisher && source.title)
      assert.equal(new URL(source.url).protocol,'https:')
    }
  }
  return bank
}

if (require.main===module) {
  const bank = validate(JSON.parse(fs.readFileSync(process.argv[2],'utf8')))
  console.log(`v${bank.version} · ${bank.status} · ${bank.questions.length} 道题`)
}
module.exports = {validate}
