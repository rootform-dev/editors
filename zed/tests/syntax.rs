use std::collections::BTreeSet;

use tree_sitter::{Language, Parser, Query, QueryCursor, StreamingIterator, Tree};

const HIGHLIGHTS_QUERY: &str = include_str!("../languages/rootform/highlights.scm");
const BRACKETS_QUERY: &str = include_str!("../languages/rootform/brackets.scm");
const INDENTS_QUERY: &str = include_str!("../languages/rootform/indents.scm");

const SAMPLE_HCL: &str = r#"
dialect "demo" {
  version = "0.1.0"
  enabled = true
  nullable = null
  label = upper("rootform")
  values = [1, 2]
  settings = { retries = 2 }

  provider "local" {
    endpoint = "http://localhost"
  }
}
"#;

fn hcl_language() -> Language {
    tree_sitter_hcl::LANGUAGE.into()
}

fn parse_sample(language: &Language) -> Tree {
    let mut parser = Parser::new();
    parser
        .set_language(language)
        .expect("the pinned HCL grammar should load");

    let tree = parser
        .parse(SAMPLE_HCL, None)
        .expect("the sample source should produce a syntax tree");
    assert!(
        !tree.root_node().has_error(),
        "sample HCL should parse without errors: {}",
        tree.root_node().to_sexp()
    );
    tree
}

fn capture_names(query: &Query, tree: &Tree) -> BTreeSet<String> {
    let mut cursor = QueryCursor::new();
    let mut names = BTreeSet::new();

    let mut matches = cursor.matches(query, tree.root_node(), SAMPLE_HCL.as_bytes());
    while let Some(query_match) = matches.next() {
        for capture in query_match.captures {
            names.insert(query.capture_names()[capture.index as usize].to_owned());
        }
    }

    names
}

fn assert_captures(query: &Query, tree: &Tree, expected: &[&str]) {
    let actual = capture_names(query, tree);
    for name in expected {
        assert!(
            actual.contains(*name),
            "expected capture @{name}; actual captures: {actual:?}"
        );
    }
}

#[test]
fn all_shipped_queries_compile_against_the_pinned_hcl_grammar() {
    let language = hcl_language();
    for (name, source) in [
        ("highlights", HIGHLIGHTS_QUERY),
        ("brackets", BRACKETS_QUERY),
        ("indents", INDENTS_QUERY),
    ] {
        Query::new(&language, source)
            .unwrap_or_else(|error| panic!("{name} query failed to compile: {error:?}"));
    }
}

#[test]
fn shipped_queries_capture_representative_error_free_hcl() {
    let language = hcl_language();
    let tree = parse_sample(&language);

    let highlights = Query::new(&language, HIGHLIGHTS_QUERY)
        .expect("highlights query should compile against the pinned HCL grammar");
    assert_captures(
        &highlights,
        &tree,
        &[
            "keyword", "type", "property", "function", "string", "boolean", "constant", "number",
        ],
    );

    let brackets = Query::new(&language, BRACKETS_QUERY)
        .expect("brackets query should compile against the pinned HCL grammar");
    assert_captures(&brackets, &tree, &["open", "close"]);

    let indents = Query::new(&language, INDENTS_QUERY)
        .expect("indents query should compile against the pinned HCL grammar");
    assert_captures(&indents, &tree, &["indent", "outdent"]);
}
