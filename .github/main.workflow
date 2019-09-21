workflow "Build on push" {
  on = "push"
  resolves = ["npm publish", "npm run lint", "npm run codecov"]
}

action "npm install" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
}

action "npm run lint" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["npm install"]
  args = "run lint"
}

action "npm run build" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["npm install"]
  args = "run build"
}

action "npm test" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["npm install"]
  args = "test -- --coverage"
}

action "npm run codecov" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["npm test"]
  args = "run codecov -- --token=\"$CODECOV_TOKEN\""
  secrets = ["CODECOV_TOKEN"]
}

action "tag" {
  needs = ["npm test"]
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "npm publish" {
  uses = "actions/npm@master"
  needs = ["tag", "npm run build", "npm run lint"]
  args = "publish--access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
