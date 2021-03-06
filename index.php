<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CryptoPro Example</title>
		<link rel="stylesheet" href="css/bootstrap.min.css">
		<link rel="stylesheet" href="css/app.css">
  </head>
<body>
  <div class="container-fluid">
    <div class="form-group">
      <label>Выберите сертификат:</label>
      <select size="4" class="form-control" id="CertListBox"></select>
    </div>
    <div class="form-group hidden">
      <input type="button" id="get-hash" class="btn btn-primary" value="Получить хэш"/>
      <input type="button" id="sign" class="btn btn-success" value="Подписать"/>
    </div>
		<div class="row">
			<div class="col-md-12">
				<div class="tabbable" id="tabs">
					<ul class="nav nav-tabs">
						<li class="hidden">
							<a href="#panel-hash" data-toggle="tab">Hash</a>
						</li>
						<li class="hidden">
							<a href="#panel-file" data-toggle="tab">File</a>
						</li>
						<li>
							<a href="#panel-form" data-toggle="tab">Form</a>
						</li>
						<li class="active">
							<a href="#panel-form-file" data-toggle="tab">Form File</a>
						</li>
					</ul>
					<div class="tab-content">
						<div role="tabpanel" class="tab-pane" id="panel-hash">
							<?include('./pages/hash.php');?>
						</div>
						<div role="tabpanel" class="tab-pane" id="panel-file">
							<?include('./pages/file.php');?>
						</div>
						<div role="tabpanel" class="tab-pane" id="panel-form">
							<?include('./pages/form.php');?>
						</div>
						<div role="tabpanel" class="tab-pane active" id="panel-form-file">
							<?include('./pages/formFile.php');?>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
  <script src="js/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/es6.js"></script>
	<script src="js/ie_eventlistner_polyfill.js"></script>
	<script src="js/cadesplugin_api.js"></script>
	<script src="js/cryptopro.js"></script>
	<script src="js/app.js"></script>
</body>
</html>
