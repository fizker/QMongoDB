var QMongoDB = require('./../q-mongodb');

function testDbCollection() {
    return QMongoDB.db('q-mobngodb-test')
    .invoke('collection', 'people')
    .then(function (collection) {
        return collection.remove()
            // We now have an empty collection.  Verify.
            .invoke('count').then(function (count) {
                if (count != 0) {
                    throw new Error("Db not empty after remove call");
                }

                return collection;
            })
        // Insert some data
        .invoke('insert', [
                { name:"The Dude" },
                { name:"Walter" },
                { name:"Donny" }
            ])
        .then(function() { return collection })
        .invoke('find')
        // passes a Cursor
        .invoke('toArray')
    })
        .then(function (items) {
            if (!items || items.length !== 3) {
                throw new Error("Invalid items");
            }

            console.log("testDbCollection Success.");
            console.dir(items);
        }).fail(function (err) {
            console.log("testDbCollection Error:");
            console.dir(err);
        });
}

function testPassingDbPromiseInsteadOfDb() {
    var dbPromise = QMongoDB.db('q-mobngodb-test');

    return QMongoDB.collection(dbPromise, 'people').then(function (collection) {
        if (!collection) {
            throw new Error("Collection is null");
        } else {
            console.log("testPassingDbPromiseInsteadOfDb Success.");
        }
    }).fail(function (err) {
            console.log("testPassingDbPromiseInsteadOfDb Error:");
            console.dir(err);
        });
}

function testSameDb() {
    var dbName = 'testSameDb', db1, db2;

    return QMongoDB.db(dbName).then(function (db) {
        db1 = db;

        return QMongoDB.db(dbName);
    }).then(function (db) {
            db2 = db;

            if (db1 && db1 === db2) {
                console.log("testSameDb Success.");
            } else {
                throw new Error("Dbs not the same instance");
            }
        }).fail(function (err) {
            console.log("testSameDb Error:");
            console.dir(err);
        });
}

function testClosingDbs() {
    return QMongoDB.closeAll().then(function () {
        console.log("testClosingDbs Success.");
    }).fail(function (err) {
            console.log("testClosingDbs Error:");
            console.dir(err);
        });

}

function testClosingAllYieldsDifferentDbs() {
    var dbName = 'test_closing_all_yields_different_dbs',
        db1, db2;

    return QMongoDB.db(dbName).then(function (db) {
        db1 = db;
    }).then(QMongoDB.closeAll).then(function () {
            return QMongoDB.db(dbName);
        }).then(function (db) {
            db2 = db;

            if (db1 && db2 && db1 !== db2) {
                console.log('testClosingAllYieldsDifferentDbs Success.');
            } else {
                throw new Error("Dbs null or same");
            }
        }).fail(function (err) {
            console.log('testClosingAllYieldsDifferentDbs Error:');
            console.dir(err);
        });
}

testDbCollection()
    .then(testPassingDbPromiseInsteadOfDb)
    .then(testSameDb)
    .then(testClosingDbs)
    .then(testClosingAllYieldsDifferentDbs)
    .then(QMongoDB.closeAll);