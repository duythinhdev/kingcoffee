const path = require('path');
const fs = require('fs');
const config = require('./config');
const _ = require('lodash');
const Queue = require('../../kernel/services/queue');

const mediaQ = Queue.create(`media_${process.env.LOCAL_ID}`);
const uploadQ = Queue.create(`media_upload_${process.env.LOCAL_ID}`);
const Video = require('./components/video');

function createFileName(folder, filePath, prefix = '') {
  // prevent overwrite existing file
  const rand = Helper.String.randomString(7);
  const name = `${prefix}${rand}_${Helper.String.getFileName(filePath)}`;
  return `${folder}/${name}`;
}

function removeLocalFile(media) {
  if (media.originalPath) {
    if (fs.existsSync(media.originalPath)) {
      fs.unlinkSync(media.originalPath);
    } else if (fs.existsSync(path.resolve(media.originalPath))) {
      fs.unlinkSync(path.resolve(media.originalPath));
    } else if (fs.existsSync(path.join(process.env.APP_ROOT_DIR, media.originalPath))) {
      fs.unlinkSync(path.join(process.env.APP_ROOT_DIR, media.originalPath));
    }
  }

  if (media.filePath) {
    if (fs.existsSync(media.filePath)) {
      fs.unlinkSync(media.filePath);
    } else if (fs.existsSync(path.resolve(media.filePath))) {
      fs.unlinkSync(path.resolve(media.filePath));
    } else if (fs.existsSync(path.join(process.env.APP_ROOT_DIR, media.filePath))) {
      fs.unlinkSync(path.join(process.env.APP_ROOT_DIR, media.filePath));
    }
  }

  if (media.thumbPath) {
    if (fs.existsSync(media.thumbPath)) {
      fs.unlinkSync(media.thumbPath);
    } else if (fs.existsSync(path.resolve(media.thumbPath))) {
      fs.unlinkSync(path.resolve(media.thumbPath));
    } else if (fs.existsSync(path.join(process.env.APP_ROOT_DIR, media.thumbPath))) {
      fs.unlinkSync(path.join(process.env.APP_ROOT_DIR, media.thumbPath));
    }
  }

  if (media.mediumPath) {
    if (fs.existsSync(media.mediumPath)) {
      fs.unlinkSync(media.mediumPath);
    } else if (fs.existsSync(path.resolve(media.mediumPath))) {
      fs.unlinkSync(path.resolve(media.mediumPath));
    } else if (fs.existsSync(path.join(process.env.APP_ROOT_DIR, media.mediumPath))) {
      fs.unlinkSync(path.join(process.env.APP_ROOT_DIR, media.mediumPath));
    }
  }
}

const uploadImage = async (med, opt) => {
  // do upload to storage and delete local file
  try {
    const media = med;
    const options = opt || {};
    const update = {};
    if (media.type === 'photo') {
      if (media.filePath && !Helper.String.isUrl(media.filePath)) {
        const fileName = createFileName('photos', media.filePath);
        const storageAPIFileUrl = await Service.StorageAPI.uploadFile(media.filePath, {
          fileName
        });
        update.originalPath = storageAPIFileUrl.url;
        update.filePath = storageAPIFileUrl.url;
      }

      if (media.thumbPath && !Helper.String.isUrl(media.thumbPath)) {
        const fileName = createFileName('photos', media.thumbPath);
        const storageAPIFileUrl = await Service.StorageAPI.uploadFile(media.thumbPath, {
          fileName
        });
        update.thumbPath = storageAPIFileUrl.url;
      }

      if (media.mediumPath && !Helper.String.isUrl(media.mediumPath)) {
        const fileName = createFileName('photos', media.mediumPath);
        const storageAPIFileUrl = await Service.StorageAPI.uploadFile(media.mediumPath, {
          fileName
        });
        update.mediumPath = storageAPIFileUrl.url;
      }
    } if (media.type === 'video') {
      if (media.filePath && !Helper.String.isUrl(media.filePath)) {
        const fileName = createFileName('videos', media.filePath);
        const storageAPIFileUrl = await Service.StorageAPI.uploadFile(media.filePath, {
          fileName
        });
        update.filePath = storageAPIFileUrl.url;
      }

      if (media.originalPath && !Helper.String.isUrl(media.originalPath)) {
        const fileName = createFileName('videos', media.originalPath, 'origin_');
        const storageAPIFileUrl = await Service.StorageAPI.uploadFile(media.originalPath, {
          fileName
        });
        update.originalPath = storageAPIFileUrl.url;
      }
    } else if (media.filePath && !Helper.String.isUrl(media.filePath)) {
      const fileName = createFileName('files', media.filePath);
      const storageAPIFileUrl = await Service.StorageAPI.uploadFile(media.filePath, {
        fileName,
      });
      update.filePath = storageAPIFileUrl.url;
      update.originalPath = storageAPIFileUrl.url;
    }

    // delete file
    removeLocalFile(media);

    update.uploaded = true;
    _.keys(update).forEach(key => {
      media[key] = update[key];
    });

    await media.save();

  } catch (e) {
    await Service.Logger.create({
      level: 'error',
      error: e,
      path: 'upload-s3'
    });
  }
};

const onConvertVideo = async video => {
  const data = video;
  try {
    const canPlay = await Video.canPlayInBrowser(data.filePath);
    if (!canPlay) {
      data.convertStatus = 'processing';
      // await DB.Media.update({
      //   _id: data.mediaId
      // }, {
      //   $set: {
      //     convertStatus: 'processing'
      //   }
      // });
      const convertFileName = await Video.toMp4({
        filePath: data.filePath
      });

      // await DB.Media.update({ _id: data.mediaId }, {
      //   $set: {
      //     filePath: path.join(config.videoDir, convertFileName),
      //     mimeType: 'video/mp4',
      //     convertStatus: 'done'
      //   }
      // });
      data.filePath = path.join(config.videoDir, convertFileName);
      data.mimeType = 'video/mp4';
      data.convertStatus = 'done';
      await data.save();
      // TODO - remove original file
    } else {
      // await DB.Media.update({ _id: data.mediaId }, {
      //   $set: { convertStatus: 'done' }
      // });
      data.convertStatus = 'done';
      await data.save();
    }
    if (!data.uploaded) {
      const media = await DB.Media.findOne({ _id: data.mediaId });
      if (media) {
        await this.uploadStorage(media);
      }
    }
  } catch (e) {
    await DB.Media.update({ _id: data.mediaId }, {
      $set: { convertStatus: 'failed' }
    });
    await Service.Logger.create({
      level: 'error',
      error: e,
      path: 'media-error'
    });
  }
}

exports.uploadStorage = async(media, options) => 
  await uploadImage(media, options);

exports.convertVideo = async video => 
  await onConvertVideo(video);