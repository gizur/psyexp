#!/bin/bash

PORT=3000
EXPERIMENT=32b3f330-0471-4dde-8f43-9282fc669ec2
TRIAL1=0e804680
TRIAL2=27adb2d3

echo "Remove old test data:"
s3cmd rm s3://psyexp/$EXPERIMENT/*

echo -e "\nShuold say alive and well:"
curl http://localhost:3000/status

echo -e "\n\nTry to add an experiment, should get a uuid back:"
curl -d '{"name": "My experiment", "email": "me@example.com"}' -X POST http://localhost:3000/add

echo -e "\n\nSave some data in two trials for an experiment:"
curl -d 'Whatever you want to save (CSV, JSON etc.)' -X POST http://localhost:$PORT/$EXPERIMENT/$TRIAL1
echo -e ""
curl -d 'Whatever you want to save (CSV, JSON etc.) again' -X POST http://localhost:$PORT/$EXPERIMENT/$TRIAL2
# make sure that the save completes before listing the trials
sleep 2

echo -e "\n\nList trials that have been stored:"
curl http://localhost:$PORT/$EXPERIMENT

echo -e "\n\n"
