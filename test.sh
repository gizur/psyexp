#!/bin/bash

PORT=3000
EXPERIMENT=60f1d258-1663-4391-b518-301a4dc59f37
TRIAL=0e804680

echo "Should say that it's alive and well:"
curl http://localhost:3000/status

echo -e "\n\nSave some data in a trail for an experiment:"
curl -d 'Whatever you want to save (CSV, JSON etc.)' -X POST http://localhost:$PORT/$EXPERIMENT/$TRIAL

echo -e "\n\nList trials that have been stored:"
curl http://localhost:$PORT/$EXPERIMENT

#echo -e "\n\nFetch the data for a trial:"
#curl http://localhost:$PORT/$EXPERIMENT/$TRIAL

echo -e "\n\n"
