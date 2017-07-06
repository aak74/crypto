<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Capicom Example</title>
		<link rel="stylesheet" href="../css/bootstrap.min.css">
		<link rel="stylesheet" href="../css/app.css">
  </head>
<body>
  <div class="container-fluid">
    <div class="form-group">
      <label>Выберите сертификат:</label>
      <select size="4" class="form-control" id="CertListBox"></select>
    </div>
    <div class="form-group">
      <input type="button" id="sign" class="btn btn-success" value="Подписать"/>
    </div>
		<div class="row">
			<div class="col-md-12">
				<?include('../pages/hashCC.php');?>
			</div>
		</div>
	</div>
  <script src="../js/jquery.min.js"></script>
	<script src="../js/bootstrap.min.js"></script>
	<script src="js/capicom.js"></script>
	<script src="js/crypto.js"></script>
	<script src="js/app.js"></script>
</body>
</html>
