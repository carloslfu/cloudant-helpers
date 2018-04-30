export const createDBs = async function (cloudant, dbNames) {
  try {
    for (let i = 0, name; name = dbNames[i]; i++) {
      await cloudant.db.create(name)
    }
  } catch (e) {
    console.log('createDBs', e)
  }
}

export const destroyDBs = async function (cloudant) {
  try {
    let list = await cloudant.db.list()
    for (let i = 0, name; name = list[i]; i++) {
      await cloudant.db.destroy(name)
    }
  } catch (e) {
    console.log('destroyDBs', e)
  }
}

let stressTypes = ['lookups', 'writes', 'queries']

export const stressCloudant = async function stressCloudant (cloudant, dbName, type, num) {
  try {
    let DB = await cloudant.db.use(dbName)
    let iters = [...Array(num).keys()]
    if (type === 'queries') {
      await Promise.all(iters.map(
        () => DB.list({ include_docs: true })
      ))
    } else if (type === 'writes') {
      let res = await Promise.all(iters.map(
        () => DB.insert({ hello: 'hello' })
      ))
    } else if (type === 'lookups') {
      let id = Math.random() * 1000 + 'xyz'
      DB.insert({ _id: id, hello: 'hello' })
      await Promise.all(iters.map(
        () => DB.get(id)
      ))
    } else if (type === 'all') {
      for (let i = 0; i < 3; i++) {
        stressCloudant(cloudant, dbName, stressTypes[i], num)
      }
    }
  } catch (e) {}
}

// Cloudant wrapper for resilient api calls
export const cdt = (inst, name: string, ...data): Promise<any> => {
  const _cdt = async (inst, name: string, resolve, reject, data) => {
    try {
      resolve(await inst[name](...data))
    } catch (e) {
      if (e.statusCode === 429) {
        setTimeout(() => {
          _cdt(inst, name, resolve, reject, data)
        }, 1000)
      } else {
        reject(e)
      }
    }
  }

  return new Promise((resolve, reject) => {
    _cdt(inst, name, resolve, reject, data)
  })
}
