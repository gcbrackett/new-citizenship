<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<title>Database Create for Citizenship</title>
</head>
<body>
<?php
$db1 = $_REQUEST["dbtocopy"];
$db2 = $_REQUEST["newdb"];

$link = mysql_pconnect("localhost","ctzuser","pr1v@te")
	or die("Error - Could not connect to server.");

// get array of table names in $db1
mysql_select_db($db1);
$result = mysql_query("SHOW TABLES")
	or die("Error - Could not get table names: " . mysql_error());
$table_names = array();
while ($row=mysql_fetch_array($result)) {
	$table_names[] = $row[0];
}

// make new database

mysql_query("DROP DATABASE IF EXISTS $db2");
mysql_query("CREATE DATABASE $db2")
	or die("Error - Could not create database $db2: " . mysql_error());
mysql_select_db($db2);

// copy all tables with contents from $db1 to $db2
// using query CREATE TABLE name SELECT * FROM db1.name
for ($i=0;$i<count($table_names);$i++) {
	mysql_query("CREATE TABLE " . $table_names[$i] . " SELECT * FROM " . $db1 . ".$table_names[$i]");
}
echo( count($table_names) . " tables copied from $db1 to $db2." );
mysql_free_result($result);
?>
</body>
</html>
