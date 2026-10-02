policy_pack "checks" { version = "0.1.0" }

policy "network" {
  target { concept = demo.concept.network }
  assert = length(contexts(rf.context.network)) > 0
  message = "Network context required."
}
