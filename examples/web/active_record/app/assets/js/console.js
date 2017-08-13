$(function() {
	$('#cmd').terminal(function(command, term) {
			term.pause();
			$.post('console', JSON.stringify({ command: command }))
			.then(function(response) {
				if (response.stdout) term.echo("\x1b[1;32m\[SUCCESS\\]\x1b[0m").resume();
				if (response.stderr) term.echo("\x1b[1;31m\[FAIL\\] "+ response.stderr +"\x1b[0m").resume();
			});
	}, {
			greetings: ["> "+ new Date().toDateString(),
				"> ",
      	'\n'
    	].join('\n'),
			onBlur: function() {
					return false;
			},
			name: 'active_record',
			height: 300,
			prompt: 'active_record> '
	});
});
