workflow "packtracker.io" {
  on = "push"
  resolves = ["Report to packtracker.io"]
}

action "Report to packtracker.io" {
  uses = "packtracker/github-action@2.1.0"
  secrets = ["PT_PROJECT_TOKEN"]
  env = {
    PT_PROJECT_ROOT = "./frontend"
  }
}
