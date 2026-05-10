<?php
require_once 'config.php';
if (!empty($_SESSION['user'])) {
    jsonResponse(['loggedIn' => true, 'user' => $_SESSION['user']]);
} else {
    jsonResponse(['loggedIn' => false]);
}
