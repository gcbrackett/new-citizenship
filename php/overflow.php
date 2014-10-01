<?php 
/*
function mysql2json($mysql_result,$name){
     $json="{\n\"$name\": [\n";
     $field_names = array();
     $fields = mysql_num_fields($mysql_result);
     for($x=0;$x<$fields;$x++){
          $field_name = mysql_fetch_field($mysql_result, $x);
          if($field_name){
               $field_names[$x]=$field_name->name;
          }
     }
     $rows = mysql_num_rows($mysql_result);
     for($x=0;$x<$rows;$x++){
          $row = mysql_fetch_array($mysql_result);
          $json.="{\n";
          for($y=0;$y<count($field_names);$y++) {
               $json.="\"$field_names[$y]\" :	\"$row[$y]\"";
               if($y==count($field_names)-1){
                    $json.="\n";
               }
               else{
                    $json.=",\n";
               }
          }
          if($x==$rows-1){
               $json.="\n}\n";
          }
          else{
               $json.="\n},\n";
          }
     }
     $json.="]\n};";
     return($json);
}

function listByStatus($type) {

	$section = "";
	if ($type == "web") {
		$section .= "<div style='width: 300px; color: #b6423e; font: bold 18px/22px helvetica,san-serif; text-align: center; margin-bottom: 10px'>List by Status</div>";
	}

	// leave out names preceded by '~', which indicate deleted students
	$query = "SELECT * FROM student WHERE status > 799 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);
	if ($type == "web") {
		$section .= "<strong>Status > 800:</strong> Kudos at CC, 50 Points to Give, Honor Roll (Prizes at 1000)";
		if ($num_results == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .= doStatusList($query);
		}
	} else {
		$section .= "Status > 800: Kudos at CC, 50 Points to Give, Honor Roll (Prizes at 1000)" . "\n\n";
		if ($num_results == 0) {
			$section .= "No students";
		} else {
			$section .= doStatusListText($query,"\t");
		}
	}
	
	$query = "SELECT * FROM student WHERE status BETWEEN 600 AND 799 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);
	if ($type == "web") {
		$section .= "<strong>Status 600 - 799:</strong> Opportunities for Enrichment Programs";
		if ($num_results == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .= doStatusList($query);
		}
	} else {
		$section .= "Status 600 - 799: Opportunities for Enrichment Programs" . "\n\n";
		if ($num_results == 0) {
			$section .= "No students";
		} else {
			$section .= doStatusListText($query,"\t");
		}
	}
	
	$query = "SELECT * FROM student WHERE status BETWEEN 400 AND 599 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);
	if ($type == "web") {
		$section .= "<strong>Status 400 - 599:</strong> Normal Range";
		if ($num_results == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .= doStatusList($query);
		}
	} else {
		$section .= "Status 400 - 599: Normal Range" . "\n\n";
		if ($num_results == 0) {
			$section .= "No students";
		} else {
			$section .= doStatusListText($query,"\t");
		}
	}
	
	$query = "SELECT * FROM student WHERE status BETWEEN 200 AND 399 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);
	if ($type == "web") {
		$section .= "<strong>Status 200 - 399:</strong> Parent Calls, Ineligible for Citizenship Enrichment Activities";
		if ($num_results == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .= doStatusList($query);
		}
	} else {
		$section .= "Status 200 - 399: Parent Calls, Ineligible for Citizenship Enrichment Activities" . "\n\n";
		if ($num_results == 0) {
			$section .= "No students";
		} else {
			$section .= doStatusListText($query,"\t");
		}
	}
	
	$query = "SELECT * FROM student WHERE status < 200 AND lastName NOT LIKE '~%' ORDER BY status DESC";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);
	if ($type == "web") {
		$section .= "<strong>Status < 199:</strong> Parent Calls, Detention, No Sports";
		if ($num_results == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .= doStatusList($query);
		}
	} else {
		$section .= "Status < 199: Parent Calls, Detention, No Sports" . "\n\n";
		if ($num_results == 0) {
			$section .= "No students";
		} else {
			$section .= doStatusListText($query,"\t");
		}
	}
	
	return $section;
}

function listByName($type) {

	$section = "";
	if ($type == "web") {
		$section .= "<div style='color: #b6423e; font: bold 18px/22px helvetica,san-serif; margin-left: 90px; margin-bottom: 10px'>List by Name</div>";
	}
	
	// leave out names preceded by '~', which indicate deleted students
	$query = "SELECT * FROM student WHERE lastName NOT LIKE '~%' ORDER BY lastName ASC";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);
	if ($type == "web") {
		if ($num_results == 0) {
			$section .= "<blockquote><i>No students</i></blockquote>";
		} else {
			$section .= doStatusList($query);
		}
	} else {
		if ($num_results == 0) {
			$section .= "No students";
		} else {
			$section .= doStatusListText($query);
		}
	}
	return $section;
}

function listByCrew($type){
	
	$section = "";
	if ($type == "web") {
		$section .= "<div style='color: #b6423e; font: bold 18px/22px helvetica,san-serif; margin-left: 90px; margin-bottom: 10px'>List by Crew</div>";
	}
	$crews = array();
	
	$query = "SELECT id, name FROM crew";
	$result = mysql_query($query);
	$num_results = mysql_num_rows($result);

	// iterate over crews
	for($i=0;$i<$num_results;$i++) {
		$row = mysql_fetch_array($result);
		extract($row);		//$id and $name are now set

		// iterate over students to gather status
		// leave out names preceded by '~', which indicate deleted students

		$query2 = "SELECT status FROM student WHERE crewid='$id' AND lastName NOT LIKE '~%'";
		$result2 = mysql_query($query2);
		$num_results2 = mysql_num_rows($result2);
		$crewsum = 0;
		for ($j=0;$j<$num_results2;$j++) {
			$row2 = mysql_fetch_array($result2);
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
		if ($type == "web") {
			$section .= '<table width="300" border="0"><tr>';
			$section .= '<td width="50%"><strong>Crew: ' . $names[$crewid] 
				. '</strong></td><td>Average Status = ' . $crewav . '</td>';
			$section .=  '</tr></table>';
		} else {
			$section .= "Crew: " . $names[$crewid] . "\nAverage Status = " . $crewav . "\n\n";
		}

		// leave out names preceded by '~', which indicate deleted students
		$query = "SELECT * FROM student WHERE crewid='$crewid' AND lastName NOT LIKE '~%' ORDER BY status DESC";
		$result3 = mysql_query($query);
		$num_results3 = mysql_num_rows($result3);
		if ($type == "web") {
			if ($num_results3 == 0) {
				$section .= "<blockquote><i>No students</i></blockquote>";
			} else {
				$section .=  doStatusList($query);
			}
		} else {
			if ($num_results3 == 0) {
				$section .= "No students";
			} else {
				$section .= doStatusListText($query,"\t");
			}
		}
	}
	return $section;
}

function doStatusList($query) {
	$result = mysql_query($query);
	$list = '<table width="300" border="0"><tr><td width="10%">&nbsp;</td><td width="65%"><strong>Name</strong></td><td><strong>Status</strong></td></tr>';
	$items = mysql_num_rows($result);
	for ($i=0; $i<$items; $i++) {
		$row = mysql_fetch_array($result);
		$list .= "<tr><td>&nbsp;</td><td>" . $row['lastName'] . ", " . $row['firstName'] . "</td><td>" . $row['status'] . "</td></tr>";
	}
	$list .= "</table><br />";
	return $list;
}

function doStatusListText($query, $leadchar = "") {
	$result = mysql_query($query);
	$list = "";
	$items = mysql_num_rows($result);
	for ($i=0; $i<$items; $i++) {
		$row = mysql_fetch_array($result);
		$list .= $leadchar . $row['lastName'] . ", " . $row['firstName'] . "\t" . $row['status'] . "\n";
	}
	$list .= "\n";
	
	return $list;
}

*/
 ?>