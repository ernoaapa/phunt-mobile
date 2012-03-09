package com.phunt;

import org.apache.cordova.DroidGap;

import android.os.Bundle;

public class Phunt extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}