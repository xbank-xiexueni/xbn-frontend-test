# # !/bin/bash
# a=$CF_PAGES_BRANCH
# b=master
# if [ "$a" = "$b" ]
# then
#    npm run build:production
# else
#    npm i -g rimraf
#    rimraf node_modules
#    npm i --legacy-peer-deps
#    npm run build
# fi