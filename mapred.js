document.addEventListener('DOMContentLoaded', function() {
    // Add click event listener to top button
    const topButton = document.getElementById('topButton');
    topButton.addEventListener('click', function() {
        alert('Top button clicked!');
    });

    // Add click event listeners to each button in the button group
    const REJECT = document.getElementById('REJECT');
    const ACCEPT = document.getElementById('ACCEPT');

    REJECT.addEventListener('click', function() {
        alert('REJECT clicked!');
    });

    ACCEPT.addEventListener('click', function() {
        alert('ACCEPT clicked!');
    });


    // Initialize the map
    const map = L.map('map').setView([0, 0], 15); // Centered at (0, 0) with zoom level 15

    // Add the base tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Get the user's location and show on the map
    getLocationAndShowOnMap();

    function getLocationAndShowOnMap() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    // Set map view to user's location
                    map.setView([latitude, longitude], 15);

                    // Add a marker at the user's location
                    L.marker([latitude, longitude]).addTo(map)
                        .bindPopup('Your Location').openPopup();
                },
                error => {
                    console.error('Error getting location:', error);
                    alert('Error getting your location. Please try again later.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    }
});

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.support.v7.app.AppCompatActivity;
import android.widget.Toast;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

public class MainActivity extends AppCompatActivity {

    private static final int CAPTURE_VIDEO_ACTIVITY_REQUEST_CODE = 200;
    private static final int SERVER_PORT = 8080;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Start listening for incoming record requests
        startRecordRequestListener();

        // Start video recording
        startVideoRecording();
    }

    private void startVideoRecording() {
        Intent videoIntent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
        startActivityForResult(videoIntent, CAPTURE_VIDEO_ACTIVITY_REQUEST_CODE);
    }

    private void startRecordRequestListener() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    ServerSocket serverSocket = new ServerSocket(SERVER_PORT);
                    while (true) {
                        Socket socket = serverSocket.accept();
                        handleRecordRequest(socket);
                        socket.close();
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    private void handleRecordRequest(Socket socket) {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            String request = in.readLine();
            if (request != null && request.equals("record")) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        startVideoRecording();
                    }
                });
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == CAPTURE_VIDEO_ACTIVITY_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                // Video capture successful
                Toast.makeText(this, "Video recorded successfully!", Toast.LENGTH_SHORT).show();
            } else if (resultCode == RESULT_CANCELED) {
                // Video capture cancelled
                Toast.makeText(this, "Video recording cancelled.", Toast.LENGTH_SHORT).show();
            } else {
                // Video capture failed
                Toast.makeText(this, "Failed to record video.", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
