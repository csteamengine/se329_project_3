<?php
/**
 * Created by PhpStorm.
 * User: adm_gcs
 * Date: 10/25/2016
 * Time: 10:01 AM
 */

include "../includes/php/base.php";
include "../includes/php/general.php";


####################################################
###############   Preprocessing   ##################
####################################################


?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Browse | Mines of Midia</title>
    <link rel="icon" type="image/x-icon" href="/favicon.png?v=3"/>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="/includes/css/shared.css">
    <link rel="stylesheet" href="/includes/css/header.css">
    <link rel="stylesheet" href="/includes/css/footer.css">
    <script src="/includes/js/jquery-2.2.4.min.js" type="application/javascript"></script>

</head>
<?php
include "../includes/php/header.php";
?>
<body>

<div id="popular">
    <div class="item" id="search_songs_div">
        <input type="text" id="search_songs" placeholder="Search Songs">
        <button id="search_songs_button">Search</button>
    </div>
    <div class="item" id="popular_songs">
        <h3>Top 5 Songs</h3>
        <?php
        $sql = "SELECT * FROM tracks ORDER BY popularity LIMIT 5";
        $query = mysqli_query($conn, $sql);
        while($result = mysqli_fetch_assoc($query)){
            ?>
            <h3><?= $result['title']." -- ".$result['artist'] ?></h3>
            <?php
        }
        ?>
    </div>
</div>
<div id="all_songs" hidden>
<!--    TODO display a list of all the songs we have, with lots of information about them-->
<!--    When Clicked, it will take them to the player.php page and start playing.-->
</div>
</body>
</html>