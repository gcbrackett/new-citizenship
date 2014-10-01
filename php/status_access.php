<?php

/**
 * Citizenship Status database access file.
**/

 /* Main code */

$dbhost = "localhost";
$dbuser = "ctzuser";
$dbpass = "pr1v@te";
$link = NULL;

$access_op = $_REQUEST['access_op'];
$db_name = $_REQUEST['db_name'];
// can value $op_data as "0" if not required for the query to succeed
$op_data = $_REQUEST['op_data'];


if ( !isset( $access_op ) || !isset( $db_name ) || !isset($op_data ) ) {
	echo "Error: operation or data not specified.";
	exit();
}

//set timezone for seconds conversion
date_default_timezone_set('America/New_York');

$link = mysqli_connect($dbhost, $dbuser, $dbpass, $db_name);
if ( mysqli_connect_errno() ) {
	echo 'Connect Error: %s\n', mysqli_connect_error();
	exit();
}

$content = "";

switch ($access_op ) {
	case "staff":
		$query = "SELECT lastName, firstName, ID FROM staff WHERE lastName NOT LIKE '~%' ORDER BY lastName ASC";
		returnJSON($link, $query);
		break;
	case "crew":
		$query = "SELECT name, ID FROM crew WHERE name NOT LIKE 'Unknown' ORDER BY name ASC";
		returnJSON($link, $query);
		break;
	case "student":
		$query = "SELECT * FROM student WHERE lastName NOT LIKE '~%' ORDER BY lastName ASC";
		returnJSON($link, $query);
		break;
	case 'studentevents':
		$query = "SELECT staffID, seconds, items, delta FROM events WHERE studentID='" . $op_data . "' ORDER BY seconds ASC";
		returnJSON($link, $query);
		break;
	case 'staffevents':
		$query = "SELECT studentID, seconds, items, delta FROM events WHERE staffID='" . $op_data . "' ORDER BY seconds ASC";
		returnJSON($link, $query);
		break;
	case 'crewevents':
		$query = "SELECT staffID, seconds, items FROM crewevents WHERE crewID='" . $op_data . "' ORDER BY seconds ASC";
		returnJSON($link, $query);
		break;
	case "term":
		$query = "SHOW DATABASES";
		returnJSON($link, $query);
		break;
	case "byname":
		$content .= listByName($link);
		break;
	case "bystatus":
		$content .= listByStatus($link);
		break;
	case "bycrew":
		$content .= listByCrew($link);
		break;
	case "bygender":
		$content .= listByGender($link);
		break;
	case "byclass":
		$content .= listByClass($link);
		break;
	case "starttime":
		$query = "SELECT seconds FROM events LIMIT 0, 5"; 
		$content .= getStartTime($link, $query);
		break;
	case deltas:
		$query = "SELECT name, delta FROM infraction WHERE name NOT LIKE '~%' ORDER BY name ASC";
		returnJSON($link, $query);
		break;
	case kudos:
		$query = "SELECT name, delta FROM kudo WHERE name NOT LIKE '~%' ORDER BY name ASC";
		returnJSON($link, $query);
		break;
	case deltaevents:
		$query = "SELECT items, delta from events WHERE delta<'0' AND studentID='" . $op_data . "'";
		returnJSON($link, $query);
		break;
	case kudos:
		$query = "SELECT name, delta FROM kudo WHERE name NOT LIKE '~%' ORDER BY name ASC";
		returnJSON($link, $query);
		break;
	case getNextID:
		echo getNextID($link, $op_data );
		break;
	default:
		$query = "";
		echo "Error: Unknown operation.";
		break;
}

if ( isset($link) ) {
	mysqli_close( $link );
}

if($content != "") {
	echo $content;
}

/* Functions */

function returnJSON ($link, $query) {
	$arr = array();
	$rs = mysqli_query($link, $query);
	while( $row = mysqli_fetch_array( $rs, MYSQLI_ASSOC ) ) {
		$arr[] = $row;
	}
	header("Content-Type: application/json", true );
	echo '{"list":' . json_encode($arr) . '}';
}

function listByName($link) {

	$section = "<h3>List by Name</h3><hr>";
	
	// leave out names preceded by '~', which indicate deleted students
	$query = "SELECT * FROM student WHERE lastName NOT LIKE '~%' ORDER BY lastName ASC";
	$result = mysqli_query($link, $query);
	$num_results = mysqli_num_rows($result);
	if ($num_results == 0) {
		$section .= "<blockquote><i>No students</i></blockquote>";
	} else {
		$section .= doStatusList($link, $query);
	}

	return $section;
}


function listByStatus($link) {

	$section = "<h3>List by Status</h3><hr>";

	// leave out names preceded by '~', which indicate deleted students
	$query = "SELECT * FROM student WHERE status > 14 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysqli_query($link, $query);
	$num_results = mysqli_num_rows($result);
	$section .= "<strong>Status  14 - 20:</strong> Citizenship Honor Roll";
	if ($num_results == 0) {
		$section .= "<blockquote><i>No students</i></blockquote>";
	} else {
		$section .= doStatusList($link, $query);
	}
	
	$query = "SELECT * FROM student WHERE status BETWEEN 10 AND 14 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysqli_query($link, $query);
	$num_results = mysqli_num_rows($result);
	$section .= "<strong>Status 10 -14:</strong> Exemplary - eligible for prizes (Grades 9,10) or privileges (Grades 11,12)";
	if ($num_results == 0) {
		$section .= "<blockquote><i>No students</i></blockquote>";
	} else {
		$section .= doStatusList($link, $query);
	}
	
	$query = "SELECT * FROM student WHERE status BETWEEN 5 AND 9 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysqli_query($link, $query);
	$num_results = mysqli_num_rows($result);

	$section .= "<strong>Status 5 - 9:</strong> Accomplished";
	if ($num_results == 0) {
		$section .= "<blockquote><i>No students</i></blockquote>";
	} else {
		$section .= doStatusList($link, $query);
	}
	
	$query = "SELECT * FROM student WHERE status BETWEEN 1 AND 4 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysqli_query($link, $query);
	$num_results = mysqli_num_rows($result);
	$section .= "<strong>Status 1 - 4:</strong> Developing";
	if ($num_results == 0) {
		$section .= "<blockquote><i>No students</i></blockquote>";
	} else {
		$section .= doStatusList($link, $query);
	}
	
	$query = "SELECT * FROM student WHERE status = 0 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysqli_query($link, $query);
	$num_results = mysqli_num_rows($result);
	$section .= "<strong>Status = 0:</strong> Beginning - Detention (Grades 9,10) or support, monitoring, other interventions (Grades 11,12)";
	if ($num_results == 0) {
		$section .= "<blockquote><i>No students</i></blockquote>";
	} else {
		$section .= doStatusList($link, $query);
	}
	
	return $section;
}

function listByCrew($link) {
	
	$section = "<h3>List by Crew</h3><hr>";

	$crews = array();
	
	$query = "SELECT id, name FROM crew";
	$result = mysqli_query($link, $query);
	$num_results = mysqli_num_rows($result);

	// iterate over crews
	for($i=0;$i<$num_results;$i++) {
		$row = mysqli_fetch_array($result);
		extract($row);		//$id and $name are now set

		// iterate over students to gather status
		// leave out names preceded by '~', which indicate deleted students

		$query2 = "SELECT status FROM student WHERE crewid='$id' AND lastName NOT LIKE '~%'";
		$result2 = mysqli_query($link, $query2);
		$num_results2 = mysqli_num_rows($result2);
		$crewsum = 0;
		for ($j=0;$j<$num_results2;$j++) {
			$row2 = mysqli_fetch_array($result2);
			$crewsum += $row2['status'];
		}

		// record results
		if ($num_results2 == 0) {
			$crews["$id"] = 0;
		} else {
			$crews["$id"] = round($crewsum/$num_results2);
		}
		$names["$id"] = $name;
	}

	arsort($crews, SORT_NUMERIC);		// sort in descending order without reassigning keys
	
	foreach($crews as $crewid=>$crewav) {
		$section .= '<strong>Crew: ' . $names[$crewid] . '</strong><br />'
			. '<em>Average Status = ' . $crewav . '</em>';


		// leave out names preceded by '~', which indicate deleted students
		$query = "SELECT * FROM student WHERE crewid='$crewid' AND lastName NOT LIKE '~%' ORDER BY status DESC";
		$result3 = mysqli_query($link, $query);
		$num_results3 = mysqli_num_rows($result3);
		if ($num_results3 == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .=  doStatusList($link, $query);
		}
	}
	return $section;
}

function listByClass($link) {
	
	$section = "<h3>List by Class</h3><hr>";

	$classes = array();
	
	$query = "SELECT id, name FROM class";
	$result = mysqli_query($link, $query);
	$num_results = mysqli_num_rows($result);

	// iterate over classes
	for( $i=0;$i<$num_results;$i++ ) {
		$row = mysqli_fetch_array($result);
		extract($row);		//$id and $name are now set
		if ($name == "Test")
			continue;

		// iterate over students to gather status
		// leave out names preceded by '~', which indicate deleted students

		$query2 = "SELECT status FROM student WHERE classID='$id' AND lastName NOT LIKE '~%'";
		$result2 = mysqli_query($link, $query2);
		$num_results2 = mysqli_num_rows($result2);
		$classsum = 0;
		for ( $j=0;$j<$num_results2;$j++ ) {
			$row2 = mysqli_fetch_array($result2);
			$classsum += $row2['status'];
		}

		// record results
		if ($num_results2 == 0) {
			$classes["$id"] = 0;
		} else {
			$classes["$id"] = round($classsum/$num_results2);
		}
		$names["$id"] = $name;
	}

	arsort($classes, SORT_NUMERIC);		// sort in descending order without reassigning keys
	
	foreach($classes as $classid=>$classav) {
		$section .= '<strong>Class: ' . $names[$classid] . '</strong><br />'
			. '<em>Average Status = ' . $classav . '</em>';


		// leave out names preceded by '~', which indicate deleted students
		$query = "SELECT * FROM student WHERE classID='$classid' AND lastName NOT LIKE '~%' ORDER BY status DESC";
		$result3 = mysqli_query($link, $query);
		$num_results3 = mysqli_num_rows($result3);
		if ($num_results3 == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .=  doStatusList($link, $query);
		}
	}
	return $section;
}

function listByGender($link) {
	
	$section = "<h3>List by Gender</h3><hr>";

	$genders = array();
	$gendernames = array( "Male", "Female" );
	
	//$query = "SELECT id, name FROM class";
	//$result = mysqli_query($link, $query);
	// = mysqli_num_rows($result);

	// iterate over classes
	for( $i=0;$i<2;$i++ ) {
		// iterate over students to gather status
		// leave out names preceded by '~', which indicate deleted students
		$gender = $gendernames[$i];
		$query2 = "SELECT status FROM student WHERE gender='$gender' AND lastName NOT LIKE '~%'";
		$result2 = mysqli_query($link, $query2);
		$num_results2 = mysqli_num_rows($result2);
		$gendersum = 0;
		for ( $j=0;$j<$num_results2;$j++ ) {
			$row2 = mysqli_fetch_array($result2);
			$gendersum += $row2['status'];
		}

		// record results
		if ($num_results2 == 0) {
			$genders[$i] = 0;
		} else {
			$genders[$i] = round($gendersum/$num_results2);
		}
	}

	arsort($genders, SORT_NUMERIC);		// sort in descending order without reassigning keys
	
	foreach($genders as $genderid=>$genderav) {
		$section .= '<strong>Gender: ' . $gendernames[$genderid] . '</strong><br />'
			. '<em>Average Status = ' . $genderav . '</em>';


		// leave out names preceded by '~', which indicate deleted students
		$gender = $gendernames[$genderid];
		$query = "SELECT * FROM student WHERE gender='$gender' AND lastName NOT LIKE '~%' ORDER BY status DESC";
		$result3 = mysqli_query($link, $query);
		$num_results3 = mysqli_num_rows($result3);
		if ($num_results3 == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .=  doStatusList($link, $query);
		}
	}
	return $section;
}


function doStatusList($link, $query) {
	$result = mysqli_query($link, $query);
	$list = '<table class="altrowsTbl"><tr><td width="70%"><strong>Name</strong></td><td width="30%"><strong>Status</strong></td></tr>';
	$items = mysqli_num_rows($result);
	for ($i=0; $i<$items; $i++) {
		$row = mysqli_fetch_array($result);
		$list .= "<tr><td>" . $row['lastName'] . ", " . $row['firstName'] . "</td><td>" . $row['status'] . "</td></tr>";
	}
	$list .= "</table><br />";
	return $list;
}

function doStatusListText($link, $query, $leadchar = "") {
	$result = mysqli_query($link, $query);
	$list = "";
	$items = mysqli_num_rows($result);
	for ($i=0; $i<$items; $i++) {
		$row = mysqli_fetch_array($result);
		$list .= $leadchar . $row['lastName'] . ", " . $row['firstName'] . "\t" . $row['status'] . "\n";
	}
	$list .= "\n";
	
	return $list;
}

function getStartTime($link, $query) {
	$result = mysqli_query($link, $query);
	$list = array();
	$num_results = mysqli_num_rows($result);
	for ($i= 0; $i<$num_results; $i++) {
		$row = mysqli_fetch_array($result);
		$list[] = $row['seconds'];
	}
	$time = min($list);
	return $time;
}

function getNextID($link, $tableName) {
	$query = "SELECT next_id FROM tableid WHERE table_name = '" . $tableName . "'";
	$result = mysqli_query($link, $query);
	$row = mysqli_fetch_array($result);
	return $row['next_id'];
}

// utility functions

function secondsToDate($seconds) {
	return date('M/d/Y', $seconds);
}

?>
