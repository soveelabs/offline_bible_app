
/** bibles indexes **/
db.getCollection("bibles").ensureIndex({
  "_id": NumberInt(1)
},[
  
]);

/** bibles indexes **/
db.getCollection("bibles").ensureIndex({
  "bibleId": 1
},{
  "unique": true
});

/** oauth_accesstokens indexes **/
db.getCollection("oauth_accesstokens").ensureIndex({
  "_id": NumberInt(1)
},[
  
]);

/** oauth_accesstokens indexes **/
db.getCollection("oauth_accesstokens").ensureIndex({
  "accessToken": NumberInt(1)
},{
  "unique": true
});

/** oauth_authcodes indexes **/
db.getCollection("oauth_authcodes").ensureIndex({
  "_id": NumberInt(1)
},[
  
]);

/** oauth_authcodes indexes **/
db.getCollection("oauth_authcodes").ensureIndex({
  "authCode": NumberInt(1)
},{
  "unique": true
});

/** oauth_clients indexes **/
db.getCollection("oauth_clients").ensureIndex({
  "_id": NumberInt(1)
},[
  
]);

/** oauth_refreshtokens indexes **/
db.getCollection("oauth_refreshtokens").ensureIndex({
  "_id": NumberInt(1)
},[
  
]);

/** oauth_refreshtokens indexes **/
db.getCollection("oauth_refreshtokens").ensureIndex({
  "refreshToken": NumberInt(1)
},{
  "unique": true
});

/** users indexes **/
db.getCollection("users").ensureIndex({
  "_id": NumberInt(1)
},[
  
]);

/** users indexes **/
db.getCollection("users").ensureIndex({
  "email": NumberInt(1)
},{
  "unique": true
});

/** users indexes **/
db.getCollection("users").ensureIndex({
  "password_reset_token": NumberInt(1)
},{
  "unique": true
});

/** bibles records **/
db.getCollection("bibles").insert({
  "_id": ObjectId("55dd74fbbf904a8c46d043f5"),
  "__v": NumberInt(0)
});
db.getCollection("bibles").insert({
  "bibleId": "hin-dev",
  "version": "Hindi Standard Version",
  "langCode": "hin",
  "bibleUrl": "http://sovee-bibleapp.s3.amazonaws.com/hin-dev.usx",
  "_id": ObjectId("55dd75aabf904a8c46d043f6"),
  "__v": NumberInt(0)
});

/** oauth_accesstokens records **/
db.getCollection("oauth_accesstokens").insert({
  "_id": ObjectId("55e584f877ee3a0a058b4567"),
  "accessToken": "2YotnFZFEjr1zCsicMWpAA",
  "clientId": "papers3",
  "userId": "55e578cc6c2ed8dc1f3cac89",
  "expires": "01/01/2016"
});
db.getCollection("oauth_accesstokens").insert({
  "_id": ObjectId("55e6aa9bdf1f0ccc855f4cf4"),
  "accessToken": "cedc851a2aaccfb09cdc7bc7054bab709fb62d6e",
  "clientId": "papers3",
  "expires": ISODate("2015-09-02T08:51:55.512Z"),
  "userId": "alex@example.com"
});
db.getCollection("oauth_accesstokens").insert({
  "_id": ObjectId("55e6bd6ddf1f0ccc855f4cf5"),
  "accessToken": "5e81f7821e0e7eab758490682bf046c17a5eb172",
  "clientId": "papers3",
  "expires": ISODate("2015-09-02T10:12:13.630Z"),
  "userId": "alex@example.com"
});
db.getCollection("oauth_accesstokens").insert({
  "_id": ObjectId("55e81dc0ee74e52017f7b582"),
  "accessToken": "9b6e0c09735eda34c63a4133a5ec918b62e56802",
  "clientId": "papers3",
  "expires": ISODate("2015-09-04T10:15:28.63Z"),
  "userId": "alex@example.com"
});

/** oauth_authcodes records **/

/** oauth_clients records **/
db.getCollection("oauth_clients").insert({
  "_id": ObjectId("55e578cc6c2ed8dc1f3cac8a"),
  "clientId": "papers3",
  "clientSecret": "123",
  "redirectUri": "/oauth/redirect",
  "__v": NumberInt(0)
});

/** oauth_refreshtokens records **/
db.getCollection("oauth_refreshtokens").insert({
  "_id": ObjectId("55e6aa9b6a1f8c4715492e1f"),
  "refreshToken": "1c8d82abccff25af121876614fa3cf5548d5c096",
  "clientId": "papers3",
  "userId": "alex@example.com",
  "expires": ISODate("2015-09-16T07:51:55.512Z"),
  "__v": NumberInt(0)
});
db.getCollection("oauth_refreshtokens").insert({
  "_id": ObjectId("55e6bd6d6a1f8c4715492e20"),
  "refreshToken": "967c1d667a18000191e724d2bee73335087c0b52",
  "clientId": "papers3",
  "userId": "alex@example.com",
  "expires": ISODate("2015-09-16T09:12:13.630Z"),
  "__v": NumberInt(0)
});
db.getCollection("oauth_refreshtokens").insert({
  "refreshToken": "85f20b6dee46393bbe3ab2421d29db48dc349466",
  "clientId": "papers3",
  "userId": "alex@example.com",
  "expires": ISODate("2015-09-17T10:15:28.63Z"),
  "_id": ObjectId("55e81dc0c3cc2fea255a3221"),
  "__v": NumberInt(0)
});

/** system.indexes records **/
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "_id": NumberInt(1)
  },
  "ns": "bible_app.bibles",
  "name": "_id_"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "bibleId": 1
  },
  "unique": true,
  "ns": "bible_app.bibles",
  "name": "bibleId_1"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "_id": NumberInt(1)
  },
  "ns": "bible_app.oauth_accesstokens",
  "name": "_id_"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "accessToken": NumberInt(1)
  },
  "unique": true,
  "ns": "bible_app.oauth_accesstokens",
  "name": "accessToken_1"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "_id": NumberInt(1)
  },
  "ns": "bible_app.oauth_authcodes",
  "name": "_id_"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "authCode": NumberInt(1)
  },
  "unique": true,
  "ns": "bible_app.oauth_authcodes",
  "name": "authCode_1"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "_id": NumberInt(1)
  },
  "ns": "bible_app.oauth_clients",
  "name": "_id_"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "_id": NumberInt(1)
  },
  "ns": "bible_app.oauth_refreshtokens",
  "name": "_id_"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "refreshToken": NumberInt(1)
  },
  "unique": true,
  "ns": "bible_app.oauth_refreshtokens",
  "name": "refreshToken_1"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "_id": NumberInt(1)
  },
  "ns": "bible_app.users",
  "name": "_id_"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "email": NumberInt(1)
  },
  "unique": true,
  "ns": "bible_app.users",
  "name": "email_1"
});
db.getCollection("system.indexes").insert({
  "v": NumberInt(1),
  "key": {
    "password_reset_token": NumberInt(1)
  },
  "unique": true,
  "ns": "bible_app.users",
  "name": "password_reset_token_1"
});

/** users records **/
db.getCollection("users").insert({
  "_id": ObjectId("55e578cc6c2ed8dc1f3cac89"),
  "email": "alex@example.com",
  "hashed_password": "$2a$10$aZB36UooZpL.fAgbQVN/j.pfZVVvkHxEnj7vfkVSqwBOBZbB/IAAK",
  "__v": NumberInt(0)
});
