<?php
    if(isset($_FILES['images']))
    {
        for($count = 0; $count < count($_FILES['images']['name']); $count++)
        {
            $extension = pathinfo($_FILES['images']['name'][$count], PATHINFO_EXTENSION);
            $new_name = uniqid() . '.' . $extension;
            move_uploaded_file($_FILES['images']['tmp_name'][$count], 'images/' . $new_name);
        }
        echo 'success';
    }
?>
