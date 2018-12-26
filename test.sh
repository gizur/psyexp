#!/bin/bash

#SERVER=localhost
SERVER=psyexp.gizur.com
PORT=1883
EXPERIMENT=10b096cd-0a74-49d9-b798-b3c22cf9b7dc
TRIAL1=0e804680
TRIAL2=27adb2d3

echo "Remove old test data:"
s3cmd rm s3://psyexp/$EXPERIMENT/*

echo -e "\nShuold say alive and well:"
curl http://$SERVER:$PORT/status

echo -e "\n\nTry to add an experiment, should get a uuid back:"
curl -d '{"name": "My experiment", "email": "me@example.com"}' -X POST http://$SERVER:$PORT/add

echo -e "\n\nSave some data in two trials for an experiment:"
curl -d 'Whatever you want to save (CSV, JSON etc.)' -X POST http://$SERVER:$PORT/$EXPERIMENT/$TRIAL1
echo -e ""
curl -d 'Whatever you want to save (CSV, JSON etc.) again' -X POST http://$SERVER:$PORT/$EXPERIMENT/$TRIAL2
# make sure that the save completes before listing the trials
sleep 2

echo -e "\n\nList trials that have been stored:"
curl http://$SERVER:$PORT/$EXPERIMENT

echo -e "\n\nFetch data stored in AWS S3"
curl https://s3-eu-west-1.amazonaws.com/psyexp/$EXPERIMENT/$TRIAL1
echo -e "\n\n"
