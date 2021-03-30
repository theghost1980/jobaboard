import React, { Component } from 'react';
import ImageUploader from 'react-images-upload';

export default class ImgUploader extends Component {
    constructor(props) {
		super(props);
		 this.state = { pictures: [] };
         this.onDrop = this.onDrop.bind(this);
        //  this.clearImage = this.clearImage.bind(this);
	}

	onDrop(pictureFiles, pictureDataURLs) {
        //we check and if pass we assign
        var passed = false;
        if(pictureFiles.length > 0){
            const imgToCheck = pictureFiles[pictureFiles.length - 1];
            console.log(imgToCheck);
            var reader = new FileReader();
            reader.onload = function(e){
                var img = new Image();
                img.src = e.target.result;
                img.onload = function(){
                    const imgW = img.width;
                    const imgH = img.height;
                    const ar = imgW / imgH;
                    console.log(`W:${imgW},H:${imgH}. AR:${ar.toFixed(1).toString()}`);
                    if(ar >= 1){
                        console.log(`Passed`);
                        console.log(imgToCheck);
                        passed = true;
                    }else{
                        console.log('Not passed!');
                        passed = false;
                    }
                };
            };
            reader.readAsDataURL(imgToCheck);
        }
        // if(passed){
            this.setState({
                pictures: this.state.pictures.concat(pictureFiles),
            });
        // }else{
        //     this.clearImage();
        // }
        
    }
    
    // clearImage() {
    //     this.imageUploader.clearPictures();
    //     console.log('cleaned!');
    // }
    render() {
        return (
            <>
            <ImageUploader
                    withPreview={true}
                	withIcon={true}
                	buttonText='Choose images ccc'
                    onChange={this.onDrop}
                	imgExtension={['.jpg', '.gif', '.png', '.gif']}
                    maxFileSize={5242880}
                    
            />
            </>
        )
    }
}
