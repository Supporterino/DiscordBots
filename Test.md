# With Name and Mention
```json
{
  version: 1,
  type: 2,
  token: 'aW50ZXJhY3Rpb246ODU5ODMwNzU5ODM3Nzk0MzM0OlVtQURYSEJ2azdna2drZE1NUnFBTVNKMWxLQjhVbUtvWVJpRHNvN1dpbjVDaG9EWm9OSElIc1RIWjBVQ21TVEtYUUppRWJaazdMR0RmcjZWd2M1RzlSNkVMYjRTVmV6aFpvQ1hLd0g2a0ljM082UHhhdnJ4YmRsbDdySElueFNV',
  member: {
    user: {
      username: 'Supporterino',
      public_flags: 0,
      id: '244161825082441729',
      discriminator: '0704',
      avatar: '67edfba5d3325ee1642886535a7b2897'
    },
    roles: [
      '354950449981423616',
      '534482249580675072',
      '656217150083825674',
      '459473980966043660'
    ],
    premium_since: null,
    permissions: '137438953471',
    pending: false,
    nick: 'Lars',
    mute: false,
    joined_at: '2017-09-06T11:12:01.518000+00:00',
    is_pending: false,
    deaf: false,
    avatar: null
  },
  id: '859830759837794334',
  guild_id: '354698351024930837',
  data: {
    resolved: {
      users: {
        '236465758203281409': {
          username: 'Heliox',
          public_flags: 0,
          id: '236465758203281409',
          discriminator: '4991',
          avatar: '26ed30c5e96af866db1253af494b7e16'
        }
      },
      members: {
        '236465758203281409': {
          roles: [
            '534482249580675072',
            '715673224943239298',
            '656217150083825674',
            '715668876418875403',
            '803713361275650108'
          ],
          premium_since: null,
          permissions: '110699732545',
          pending: false,
          nick: null,
          joined_at: '2020-05-29T12:55:07.316000+00:00',
          is_pending: false,
          avatar: null
        }
      }
    },
    options: [
      {
        value: 'TheName',
        type: 3,
        name: 'channelname'
      },
      {
        value: '236465758203281409',
        type: 9,
        name: 'mentions'
      }
    ],
    name: 'channelcreate',
    id: '859696863040765953'
  },
  channel_id: '657308403852378144',
  application_id: '775724617461399552'
}
```

# Without name or mention
```json
{
  version: 1,
  type: 2,
  token: 'aW50ZXJhY3Rpb246ODU5ODMwNjk1NDIwODg3MTAwOk4zTXZIakthOXFoVTNTbXlHVFhQZm11bWVad3dMZXhSSTFUQTM5V3hyZE9IQkFEbFE2a1NDN2NtYkNoSk91SURLRWNXaXZkV0x1aW1NeFlmN0NYUjhBelB6TTE2ZGdxY2loWERwYVlEZGtvdWlwRGx5TjE5TEdxMWhDVnBINEc3',
  member: {
    user: {
      username: 'Supporterino',
      public_flags: 0,
      id: '244161825082441729',
      discriminator: '0704',
      avatar: '67edfba5d3325ee1642886535a7b2897'
    },
    roles: [
      '354950449981423616',
      '534482249580675072',
      '656217150083825674',
      '459473980966043660'
    ],
    premium_since: null,
    permissions: '137438953471',
    pending: false,
    nick: 'Lars',
    mute: false,
    joined_at: '2017-09-06T11:12:01.518000+00:00',
    is_pending: false,
    deaf: false,
    avatar: null
  },
  id: '859830695420887100',
  guild_id: '354698351024930837',
  data: {
    name: 'channelcreate',
    id: '859696863040765953'
  },
  channel_id: '657308403852378144',
  application_id: '775724617461399552'
}
```