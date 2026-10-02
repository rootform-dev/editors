# Synthetic lexical fixture. Hash, slash, and block comments are HCL syntax.
// Rootform block names are highlighted lexically, without semantic analysis.
/* A block comment can span lines. */
dialect "sample" {
  version = "0.1.0"
}

concept "network" {
  description = "A synthetic ${var.name} value"
  enabled     = true
  count       = 2
  note        = <<-EOT
    Example heredoc text.
  EOT
}
