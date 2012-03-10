package com.phunt;

import org.apache.cordova.DroidGap;

import android.content.pm.ActivityInfo;
import android.os.Bundle;

public class Phunt extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_NOSENSOR);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}