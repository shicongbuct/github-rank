echo "start update"
SHELL_FOLDER=$(cd "$(dirname "$0")";pwd)
cd ${SHELL_FOLDER}'../'

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
