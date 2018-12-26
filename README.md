# `psyexp`

`psyexp` is a backend for psychological experiment. The frontend can be built
in any language or tools that can use a HTTP API. Trial data is easily access
using any web browser using the unique id that each experiment has.


## Using the free hosted version

First you need to get an experiment uuid (update "My experiment" and the mail address):
`curl -d '{"name": "My experiment", "email": "me@example.com"}' -X POST http://psyexp.gizur.com:1883/add`
The response should look something like this:
`{"name":"My experiment","email":"me@example.com","uuid":"121f7f78-0d4a-4a22-810b-0eb68f08de7d"}`

Now you can save data. You will do this from the framework the experiment is
developed, for instance [jspych](https://www.jspsych.org). Each trial needs a
unique id, for instance a large random number or a sequence. Here is an example using `curl`
(make sure to replace `<EXPERIMENT>` and `<TRIAL>`):
`curl -d 'Whatever you want to save (CSV, JSON etc.)' -X POST http://psyexp.gizur.com:1883/<EXPERIMENT>/<TRIAL>`

You can list the trials that have been saved like this:
`curl http://psyexp.gizur.com:1883/<EXPERIMENT>`

And you can fetch the data for a specific trial like this:
`curl https://s3-eu-west-1.amazonaws.com/psyexp/<EXPERIMENT>/<TRIAL>`


## Setup on your own server using `npm`

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

Any language and/or framework that can perform http request can be used.
One alternative is [jspych](https://www.jspsych.org), but there are many.

A full example using jspych is yet to be developed. The `curl` commands above
illustrates how the API is used.
