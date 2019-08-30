echo "start update"
npm run build

npm run get:users
npm run get:users:china
npm run get:repos
npm run get:trending
npm run get:sifou
npm run get:36kr
npm run get:toutiao

npm start
echo "all done"
