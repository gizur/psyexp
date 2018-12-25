# `psyexp`

`psyexp` is a backend for psychological experiment. The frontend can be built
in any language or tools that can use a HTTP API.

## Setup

1. Setup a AWS S3 bucket and then create `setnev` by copying `setenv.templte` and updating it.
2. Do `source setenv`
3. Run `node psyexp.js help` for help.

Start the server with `node psyexp.js start`. Test that it is running with:
`curl -d 'Test!!' -X POST http://localhost:3000/status`


## Development using `psyexp`

Examples for how trails are stored and listed using `curl` (as an illustration):

1. Save data in an experiment. Make sure trail_no is unique or it will be overwritten (any random number will do):
`curl -d 'Whatever you want to save (CSV, JSON etc.)' -X POST http://localhost:3000/<experiment UUID>/trail_no`

2. List trials that have been stored:
`curl http://localhost:3000/<experiment UUID>`

3. Fetch the data for a trial:
`curl http://localhost:3000/<experiment UUID>/trail_no`
