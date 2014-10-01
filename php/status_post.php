<?php

/**
 * Citizenship Status database post file.
**/

 /* Main code */

$dbhost = "localhost";
$dbuser = "ctzuser";
$dbpass = "pr1v@te";
$link = NULL;

$post_op = $_POST['post_op'];
$db_name = $_POST['db_name'];
$op_data = $_POST['op_data'];


if ( !isset( $post_op ) || !isset( $db_name ) || !isset($op_data ) ) {
	echo "Error: operation or data not specified.";
	exit();
}

//set timezone for seconds conversion
date_default_timezone_set('America/New_York');

$link = mysqli_connect($dbhost, $dbuser, $dbpass, $db_name);
if ( mysqli_connect_errno() ) {
	echo 'Connect Error: %s\n' . mysqli_connect_error();
	exit();
}

switch ($post_op ) {
	case postevent:
		$query = rawurldecode($op_data);
		doQuery( $link, $query );
		// increment next_id
		$upquery = "UPDATE tableid SET next_id = next_id + 1 WHERE table_name = 'events'";
		doQuery( $link, $upquery );
		break;
	case setstatus:
		$query = rawurldecode( $op_data );
		doQuery( $link, $query );
		break;
	default:
		echo "Error: Unknown operation.";
	break;
}

if ( isset($link) ) {
	mysqli_close( $link );
}

/* Functions */

function doQuery( $link, $query ) {
	if ( !mysqli_query( $link, $query ) ) {
		echo ( "MySQL error: " . mysqli_error($link) );
	}
}

?>
`