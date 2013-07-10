// FC_test32.cpp: 主要專案檔。

#include "stdafx.h"
#include "stdlib.h"

#include "FlyCapture2.h"
#include <string>
#include <vector>

using namespace System;  
using namespace FlyCapture2;

enum AviType
{
    UNCOMPRESSED,
    MJPG,
    H264
};

void PrintError( Error error )
{
    error.PrintErrorTrace();
}

void PrintCameraInfo( CameraInfo* pCamInfo )
{
    char macAddress[64];
    sprintf( 
        macAddress, 
        "%02X:%02X:%02X:%02X:%02X:%02X", 
        pCamInfo->macAddress.octets[0],
        pCamInfo->macAddress.octets[1],
        pCamInfo->macAddress.octets[2],
        pCamInfo->macAddress.octets[3],
        pCamInfo->macAddress.octets[4],
        pCamInfo->macAddress.octets[5]);

    char ipAddress[32];
    sprintf( 
        ipAddress, 
        "%u.%u.%u.%u", 
        pCamInfo->ipAddress.octets[0],
        pCamInfo->ipAddress.octets[1],
        pCamInfo->ipAddress.octets[2],
        pCamInfo->ipAddress.octets[3]);

    char subnetMask[32];
    sprintf( 
        subnetMask, 
        "%u.%u.%u.%u", 
        pCamInfo->subnetMask.octets[0],
        pCamInfo->subnetMask.octets[1],
        pCamInfo->subnetMask.octets[2],
        pCamInfo->subnetMask.octets[3]);

    char defaultGateway[32];
    sprintf( 
        defaultGateway, 
        "%u.%u.%u.%u", 
        pCamInfo->defaultGateway.octets[0],
        pCamInfo->defaultGateway.octets[1],
        pCamInfo->defaultGateway.octets[2],
        pCamInfo->defaultGateway.octets[3]);

    printf(
        "\n*** CAMERA INFORMATION ***\n"
        "Serial number - %u\n"
        "Camera model - %s\n"
        "Camera vendor - %s\n"
        "Sensor - %s\n"
        "Resolution - %s\n"
        "Firmware version - %s\n"
        "Firmware build time - %s\n"
        "GigE version - %u.%u\n"
        "User defined name - %s\n"
        "XML URL 1 - %s\n"
        "XML URL 2 - %s\n"
        "MAC address - %s\n"
        "IP address - %s\n"
        "Subnet mask - %s\n"
        "Default gateway - %s\n\n",
        pCamInfo->serialNumber,
        pCamInfo->modelName,
        pCamInfo->vendorName,
        pCamInfo->sensorInfo,
        pCamInfo->sensorResolution,
        pCamInfo->firmwareVersion,
        pCamInfo->firmwareBuildTime,
        pCamInfo->gigEMajorVersion,
        pCamInfo->gigEMinorVersion,
        pCamInfo->userDefinedName,
        pCamInfo->xmlURL1,
        pCamInfo->xmlURL2,
        macAddress,
        ipAddress,
        subnetMask,
        defaultGateway );
}

void SaveAviHelper(
    AviType aviType,
    std::vector<Image>& vecImages,
    std::string aviFileName,
    float frameRate)
{
    Error error;
    AVIRecorder aviRecorder;

    // Open the AVI file for appending images

    switch (aviType)
    {
    case UNCOMPRESSED:
        {
            AVIOption option;
            option.frameRate = frameRate;
            error = aviRecorder.AVIOpen(aviFileName.c_str(), &option);
        }
        break;
    case MJPG:
        {
            MJPGOption option;
            option.frameRate = frameRate;
            option.quality = 75;
            error = aviRecorder.AVIOpen(aviFileName.c_str(), &option);
        }
        break;
    case H264:
        {
            H264Option option;
            option.frameRate = frameRate;
            option.bitrate = 1000000;
            option.height = vecImages[0].GetRows();
            option.width = vecImages[0].GetCols();
            error = aviRecorder.AVIOpen(aviFileName.c_str(), &option);
        }
        break;
    }

    if (error != PGRERROR_OK)
    {
        PrintError(error);
        return;
    }

    printf( "\nAppending %d images to AVI file: %s ... \n", vecImages.size(), aviFileName.c_str() );
    for (int imageCnt = 0; imageCnt < vecImages.size(); imageCnt++)
    {
        // Append the image to AVI file
        error = aviRecorder.AVIAppend(&vecImages[imageCnt]);
        if (error != PGRERROR_OK)
        {
            PrintError(error);
            continue;
        }

        printf("Appended image %d...\n", imageCnt);
    }

    // Close the AVI file
    error = aviRecorder.AVIClose( );
    if (error != PGRERROR_OK)
    {
        PrintError(error);
        return;
    }
}

int RunCamera( PGRGuid guid, int k_numImages )
{
	Error error;
	Camera cam;

	// Connect to a camera
	error = cam.Connect(&guid);
	if (error != PGRERROR_OK)
	{
		PrintError(error);
		return -1;
	}

	// Get the camera information
	CameraInfo camInfo;
	error = cam.GetCameraInfo(&camInfo);
	if (error != PGRERROR_OK)
	{
		PrintError(error);
		return -1;
	}

	PrintCameraInfo(&camInfo);

	// Start capturing images
	printf( "Starting capture... \n" );
	error = cam.StartCapture();
    if (error != PGRERROR_OK)
    {
        PrintError(error);
        return -1;
    }

    std::vector<Image> vecImages;
    vecImages.resize(k_numImages);

	// Grab images
    Image rawImage;
    for ( int imageCnt=0; imageCnt < k_numImages; imageCnt++ )
    {
        error = cam.RetrieveBuffer(&rawImage);
        if (error != PGRERROR_OK)
        {
            printf("Error grabbing image %u\n", imageCnt);
            continue;
        }
        else
        {
            printf("Grabbed image %u\n", imageCnt);
        }

        vecImages[imageCnt].DeepCopy(&rawImage);
    }

    // Stop capturing images
    printf( "Stopping capture... \n" );
    error = cam.StopCapture();
    if (error != PGRERROR_OK)
    {
        PrintError(error);
        return -1;
    }

    // Check if the camera supports the FRAME_RATE property
    printf( "Detecting frame rate from camera... \n" );
    PropertyInfo propInfo;
    propInfo.type = FRAME_RATE;
    error = cam.GetPropertyInfo( &propInfo );
    if (error != PGRERROR_OK)
    {
        PrintError(error);
        return -1;
    }

    float frameRateToUse = 15.0f;
    if ( propInfo.present == true )
    {
        // Get the frame rate
        Property prop;
        prop.type = FRAME_RATE;
        error = cam.GetProperty( &prop );
        if (error != PGRERROR_OK)
        {
            PrintError(error);
        }
		else
		{
			// Set the frame rate.
			// Note that the actual recording frame rate may be slower,
			// depending on the bus speed and disk writing speed.
			frameRateToUse = prop.absValue;
		}
    }

    printf("Using frame rate of %3.1f\n", frameRateToUse);

    char aviFileName[512] = {0};

    //sprintf(aviFileName, "SaveImageToAviEx-h264-%u", camInfo.serialNumber);
	sprintf(aviFileName, "miix-story-%u", camInfo.serialNumber);
	printf("%s", aviFileName);
    SaveAviHelper(H264, vecImages, aviFileName, frameRateToUse);

    // Disconnect the camera
    error = cam.Disconnect();
    if (error != PGRERROR_OK)
    {
        PrintError(error);
        return -1;
    }

	return 0;
}

int main(array<System::String ^> ^args)
{
	int framesNumber;
	scanf( "%d", &framesNumber );

	Error error;
	BusManager busMgr;

	// Auto force IP address to ip camera
	BusManager::ForceAllIPAddressesAutomatically();

	unsigned int numCameras;
    error = busMgr.GetNumOfCameras(&numCameras);

	PGRGuid guid;
    error = busMgr.GetCameraFromIndex(0, &guid);
	if (error != PGRERROR_OK)
    {
       PrintError(error);
       return -1;
    }

	RunCamera( guid, framesNumber );


	//printf( "Done! Press Enter to exit...\n" );
	//getchar();

	system("pause");

    return 0;
}
