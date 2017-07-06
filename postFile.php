<?
$result = [
  'status' => 'error'
];
// print_r($_FILES);
if (!empty($_FILES)) {
    if ($_FILES['file']['error'] == 0) {
      $targetFileName = './download/form-file.in';
      @unlink($targetFileName);
      // echo $targetFileName;
      move_uploaded_file($_FILES['file']['tmp_name'], $targetFileName);
      // sleep(2);
      require_once('CryptoPro.php');
      $cryptopro = new CryptoPro;
      $str = $cryptopro->getHash(file_get_contents($targetFileName));
      file_put_contents($targetFileName . '.shs', $str);
      $result = [
        'hash' => $str,
        'status' => 'ok'
      ];
    // } else {
    //   echo 'Error: ' . $_FILES['file']['error'] . '<br>';
    }
}
echo json_encode($result);
