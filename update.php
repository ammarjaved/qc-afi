<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
$data=$_POST["data"];
// echo $data;
// exit();
$req=json_decode($data);
$updates = [];
//$str="update demand_point set ";
// foreach($req as $key=> $value){
//   if($key!='gid'){  
//   $str=$str.$key.'='."'".$value."'".', ';
//   }
// }
// $str=$str." where gid=".$req->gid;

// echo $str;

foreach($req as $key => $value) {
    if($key !== 'gid') {
        // Escape single quotes and prevent SQL injection
        $safeValue = str_replace("'", "''", $value);
        $updates[] = "$key = '$safeValue'";
    }
}
// Database configuration for PostgreSQL
$host = "localhost";
$dbname = "afi";
$username = "postgres";
$password = "123";
$port = "5432";

$dsn = "pgsql:host=$host;port=$port;dbname=$dbname;user=$username;password=$password";
$conn = new PDO($dsn);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$str='';
if($req->table=='demand_point'){
$str = "UPDATE demand_point SET " . 
       implode(', ', $updates) . 
       "   WHERE gid = " . (int)$req->gid;
}else if($req->table=='fpl1'){
    $str = "UPDATE fpl1 SET " . 
       implode(', ', $updates) . 
       "   WHERE l1_id ='$req->l1_id'";
}else if($req->table=='sfp_l2'){
    $str = "UPDATE sfp_l2 SET " . 
       implode(', ', $updates) . 
       "   WHERE l2_id ='$req->l2_id'";
}else if($req->table=='mfp_l3'){
    $str = "UPDATE mfp_l3 SET " . 
       implode(', ', $updates) . 
       "   WHERE l3_id ='$req->l3_id'";
}
$stmt = $conn->prepare($str);
if($stmt->execute()) {
    $response['status'] = 'success';
    $response['message'] = 'Record updated successfully';
    $response['data'] = ['gid' => $req->gid];
} else {
    $response['status'] = 'error';
    $response['message'] = 'Failed to update record';
    $response['error'] = $stmt->errorInfo();
}

// Send JSON response
header('Content-Type: application/json');
echo json_encode($response);
 