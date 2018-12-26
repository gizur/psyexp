# `psyexp`

`psyexp` is a backend for psychological experiment. The frontend can be built
in any language or tools that can use a HTTP API.

## Setup using `npm`

1. Create a folder where `psyexp` should be installed and run `npm install psyexp`
2. Setup a AWS S3 bucket and then create `setenv` by copying `node_modules/psyexp/setenv.template` and updating it
3. Do `source setenv`
4. Run `node node_modules/psyexp/psyexp.js help` for help.

Start the server with `node node_modules/psyexp/psyexp.js start`.
Test that it is running with: `curl http://localhost:3000/status`

Copy `node_modules/psyexp/start.sh` if you want a script for starting the server.
Make sure to change the path in the script to the folder you've installed `psyexp`.

Run the unit tests to make sure things are ok: `./node_modules/psyexp/test.sh`
The results needs to be inspected manually!


## Development using `psyexp`

Examples for how trails are stored and listed using `curl` (as an illustration):

1. Save data in an experiment. Make sure trail_no is unique or it will be overwritten (any random number will do):
`curl -d 'Whatever you want to save (CSV, JSON etc.)' -X POST http://localhost:3000/<experiment UUID>/trail_no`

2. List trials that have been stored:
`curl http://localhost:3000/<experiment UUID>`

3. Fetch the data for a trial:
`curl http://localhost:3000/<experiment UUID>/trail_no`
