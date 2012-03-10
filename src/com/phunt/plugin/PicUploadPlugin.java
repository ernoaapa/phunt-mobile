package com.phunt.plugin;

import java.io.DataOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.net.Uri;
import android.util.Log;
import android.webkit.CookieManager;

import com.phonegap.api.Plugin;

public class PicUploadPlugin extends Plugin {

	private static String lineEnd = "\r\n"; 
	private static String td = "--"; 
	private static String boundary = "*****com.phunt.boundary";
	
	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		Log.i("PicUploadPlugin", "WE ARE PLUGGING IN");
		
		if (!(action.equals("upload"))) {
			return new PluginResult(PluginResult.Status.INVALID_ACTION, "You need to use the 'upload' action");
		}
		
		try {
			UploadParams params = new UploadParams();
			JSONObject jsonOb = args.getJSONObject(0);
			
			Uri fileUri = Uri.parse(jsonOb.getString("fileUri"));
			params.uploadUrl = jsonOb.getString("uploadUrl");
			params.uuid = jsonOb.getString("uuid");
			params.lat = jsonOb.getString("lat");
			params.lon = jsonOb.getString("lon");
			
			if (jsonOb.has("chainId")) {
				params.chainId = jsonOb.getString("chainId");
			}
			
			if (jsonOb.has("category")) {
				params.category = jsonOb.getString("category");
			}
			
			params.ensureHasEitherChainIdOrCategory();
			
			InputStream fileInputStream = this.ctx.getContentResolver().openInputStream(fileUri);
			
			PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
			result.setKeepCallback(true);
			
			processUpload(fileInputStream, params, callbackId);
			
			return result;
	
		} catch (JSONException e) {
			 Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
			 PluginResult result = new PluginResult(PluginResult.Status.JSON_EXCEPTION, e.getMessage());
			 error(result, callbackId);
			 return result;
		} catch (FileNotFoundException e) {
			Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
			 PluginResult result = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
			 error(result, callbackId);
			 return result;
		}
		
	
	}
	
	public void processUpload(InputStream fileInputStream, UploadParams params, final String callbackId) {
		try {
			upload(fileInputStream, params, callbackId);
			
		} catch (MalformedURLException e) { 
			 Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
			 PluginResult result = new PluginResult(PluginResult.Status.MALFORMED_URL_EXCEPTION, e.getMessage());
			 error(result, callbackId);
		
		}  catch (FileNotFoundException e) {
			 Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
			 PluginResult result = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
			 error(result, callbackId);
		
		} catch (IOException e) { 
			 Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
			 PluginResult result = new PluginResult(PluginResult.Status.IO_EXCEPTION, e.getMessage());
			 error(result, callbackId);
		
		} catch (InterruptedException e) {
			 Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
			 PluginResult result = new PluginResult(PluginResult.Status.ERROR, e.getMessage());
			 error(result, callbackId);
		} catch (JSONException e) {
			 Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
			 PluginResult result = new PluginResult(PluginResult.Status.JSON_EXCEPTION, e.getMessage());
			 error(result, callbackId);
		} 
		
	}
	
	
	public void upload(InputStream fileInputStream, UploadParams params, final String callbackId) throws IOException, JSONException, InterruptedException {
		URL url = new URL(params.uploadUrl);
		HttpURLConnection conn = (HttpURLConnection)url.openConnection();

		// Get cookies that have been set in our webview
		CookieManager cm = CookieManager.getInstance();
		String cookie = cm.getCookie(params.uploadUrl);

		// allow inputs 
		conn.setDoInput(true); 
		// allow outputs
		conn.setDoOutput(true); 
		// don't use a cached copy
		conn.setUseCaches(false);
		// use a post method 
		conn.setRequestMethod("POST"); 
		// set post headers 
		conn.setRequestProperty("Connection","Keep-Alive"); 
		conn.setRequestProperty("Content-Type","multipart/form-data;boundary="+boundary); 
		conn.setRequestProperty("Cookie", cookie);
		// open data output stream 
		DataOutputStream dos = new DataOutputStream(conn.getOutputStream()); 
		dos.writeBytes(td + boundary + lineEnd);
		
		writeData(dos, "uuid", params.uuid);
		
		if (params.shouldCreate()) {
			Log.i("PicUploadPlugin", "Category: "+params.category);
			writeData(dos, "category", params.category);
		} else {
			Log.i("PicUploadPlugin", "ChainId: "+params.chainId);
			writeData(dos, "chainId", params.chainId);
		}
		
		writeData(dos, "lat", params.lat);
		writeData(dos, "lon", params.lon);
		
		
		dos.writeBytes("Content-Disposition: form-data; name=\"image\";filename=\"picFileName.jpg\"" + lineEnd); 
		dos.writeBytes("Content-Type: image/jpg" + lineEnd); 

		dos.writeBytes(lineEnd); 
		// create a buffer of maximum size 
		int bytesAvailable = fileInputStream.available(); 
		final int total = bytesAvailable;
		Log.e("PhoneGapLog", "available: " + bytesAvailable); 

		int maxBufferSize = 1024; 
		int bufferSize = Math.min(bytesAvailable, maxBufferSize); 
		byte[] buffer = new byte[bufferSize]; 
		// read file and write it into form... 
		int bytesRead = fileInputStream.read(buffer, 0, bufferSize); 
		int progress = bytesRead;
		int send = 0;
		while (bytesRead > 0) 
		{ 
			dos.write(buffer, 0, bufferSize); 
			bytesAvailable = fileInputStream.available(); 
			bufferSize = Math.min(bytesAvailable, maxBufferSize); 
			bytesRead = fileInputStream.read(buffer, 0, bufferSize); 
			progress += bytesRead;
			final int prog = progress;
			
			
//				Sending every progress event is overkill
			if (send++ % 20 == 0) { 
				Log.e("PhoneGapLog", "read " + progress + " of " + total); 

				
				ctx.runOnUiThread(new Runnable () {
					public void run() {
						try {
							JSONObject result = new JSONObject();
							result.put("status", Status.PROGRESS); 
							result.put("progress", prog);
							result.put("total", total);
							PluginResult progressResult = new PluginResult(PluginResult.Status.OK, result);
							progressResult.setKeepCallback(true);
							success(progressResult, callbackId);
						} catch (JSONException e) {
							Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
						}
					}
				});
				
				if (progress >= total) {
					ctx.runOnUiThread(new Runnable () {
						public void run() {
							try {
								JSONObject result = new JSONObject();
								result.put("status", Status.COMPLETING); 
								result.put("progress", prog);
								result.put("total", total);
								PluginResult progressResult = new PluginResult(PluginResult.Status.OK, result);
								progressResult.setKeepCallback(true);
								success(progressResult, callbackId);
							} catch (JSONException e) {
								Log.e("PhoneGapLog", "error: " + e.getMessage(), e); 
							}
						}
					});
				}
				
//					Give a chance for the progress to be sent to javascript
				Thread.sleep(100);
				
			} 
		} 
		
		// send multipart form data necessary after file data... 
		dos.writeBytes(lineEnd); 
		dos.writeBytes(td + boundary + td + lineEnd); 

		// close streams 
		fileInputStream.close(); 
		dos.flush(); 
		
		Log.i("PicUploadPlugin", "Reading response");
		InputStream is = conn.getInputStream(); 
		int ch; 
		StringBuffer b =new StringBuffer(); 
		while( ( ch = is.read() ) != -1 ) { 
			b.append( (char)ch ); 
		} 
		String s=b.toString(); 
		dos.close(); 
		
		Log.i("PicUploadPlugin", "Response consumed.");
		
		JSONObject result = new JSONObject();
		
		result.put("status", Status.COMPLETE);
		result.put("progress", progress);
		result.put("total", total);
		result.put("result", s);
		
		PluginResult progressResult = new PluginResult(PluginResult.Status.OK, result);
		progressResult.setKeepCallback(true);
		
		Log.i("PicUploadPlugin", "Upload success! Sending COMPLETE event including result: "+s);
		success(progressResult, callbackId);
	}

	private void writeData(DataOutputStream dos, String paramName, String value) throws IOException {
		dos.writeBytes(td + boundary + lineEnd); 
		dos.writeBytes("Content-Disposition: form-data; name=\""+paramName+"\"; ");
		dos.writeBytes(lineEnd + lineEnd); 
		dos.writeBytes(value);
		dos.writeBytes(lineEnd); 
		dos.writeBytes(td + boundary + lineEnd);
	}
	
	public static class UploadParams {
		String category;
		String chainId;
		String uploadUrl;
		String uuid;
		String lat;
		String lon;
		
		public boolean shouldCreate() {
			return category != null;
		}
		
		public void ensureHasEitherChainIdOrCategory() {
			if (chainId == null && category == null) {
				throw new RuntimeException("Sucky params");
			}
		}
	}
	
	public enum Status {
		PROGRESS,
		COMPLETING,
		COMPLETE
	}
}
