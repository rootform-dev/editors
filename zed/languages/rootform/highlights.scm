[
  "!"
  "*"
  "/"
  "%"
  "+"
  "-"
  ">"
  ">="
  "<"
  "<="
  "=="
  "!="
  "&&"
  "||"
] @operator

[
  "{"
  "}"
  "["
  "]"
  "("
  ")"
] @punctuation.bracket

["." ".*" "," "[*]"] @punctuation.delimiter
[ (ellipsis) "?" "=>" ] @punctuation.special
[ ":" "=" ] @punctuation

["for" "endfor" "in" "if" "else" "endif"] @keyword

[
  (quoted_template_start)
  (quoted_template_end)
  (template_literal)
] @string

[
  (heredoc_identifier)
  (heredoc_start)
] @punctuation.delimiter

[
  (template_interpolation_start)
  (template_interpolation_end)
  (template_directive_start)
  (template_directive_end)
  (strip_marker)
] @punctuation.special

(numeric_lit) @number
(bool_lit) @boolean
(null_lit) @constant
(comment) @comment
(identifier) @variable

(function_call (identifier) @function)
(attribute (identifier) @property)

(object_elem
  key: (expression
    (variable_expr
      (identifier) @property)))

(body
  (block
    (identifier) @keyword
    (#any-of? @keyword "dialect" "concept" "context" "relation" "rule" "policy_pack" "policy")))

(body
  (block
    (body
      (block
        (identifier) @type
        (#any-of? @type "provider" "match" "context" "relation" "contribution" "composition" "target" "policy")))))
