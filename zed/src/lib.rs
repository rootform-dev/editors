use zed::{Command, Extension, Worktree};
use zed_extension_api as zed;

struct RootformExtension;

impl Extension for RootformExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &Worktree,
    ) -> zed::Result<Command> {
        // Zed handles binary.path, arguments and env overrides before this adapter.
        command_from_path(worktree.which("rootform"))
    }
}

fn command_from_path(executable: Option<String>) -> zed::Result<Command> {
    let command = executable.ok_or_else(|| {
        "Rootform executable was not found on Zed's PATH. Install a compatible Rootform CLI, or set `lsp.rootform.binary.path` and `lsp.rootform.binary.arguments` to [\"lsp\"] in Zed settings.".to_owned()
    })?;
    Ok(Command {
        command,
        args: vec!["lsp".to_owned()],
        env: Vec::new(),
    })
}

zed::register_extension!(RootformExtension);

#[cfg(test)]
mod tests {
    use super::command_from_path;

    #[test]
    fn path_executable_is_launched_directly_with_lsp() {
        let command = command_from_path(Some("/opt/Rootform Tools/rootform".to_owned()))
            .expect("local executable should be selected");
        assert_eq!(command.command, "/opt/Rootform Tools/rootform");
        assert_eq!(command.args, ["lsp"]);
        assert!(command.env.is_empty());
    }

    #[test]
    fn missing_path_executable_gives_complete_native_override_remediation() {
        let error = command_from_path(None).expect_err("missing executable must stop startup");
        assert!(error.contains("Zed's PATH"));
        assert!(error.contains("lsp.rootform.binary.path"));
        assert!(error.contains("lsp.rootform.binary.arguments"));
        assert!(error.contains("[\"lsp\"]"));
    }
}
