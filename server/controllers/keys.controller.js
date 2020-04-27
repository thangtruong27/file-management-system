const KeyStore = require('../models/keyStore');
const CryptoKey = require('../models/cryptoKey');
const FileStore = require('../models/fileStore');
const UserStore = require('../models/userStore');
const Log = require('../models/eventLog');

const { EVENT_TYPE, STATUS, PERMISSION_TYPES } = require('../helpers/constant');
const { isEmpty } = require('lodash');
const genCryptoKey = require('../helpers/keyGen');
const { convertDateToMilis } = require('../helpers/keyHelper')

module.exports = {
  get: async (req, res) => {
    const { keyList } = req.user;

    const keys = await KeyStore.find({ _id: { $in: keyList } }).populate('owner', 'fullname').lean();
    res.status(200).json({
      status: "SUCCESS",
      data: {
        keys: keys
      }
    })
  },

  update: async (req, res) => {
    const { key } = req.body;
    const { keyId } = req.params;

    if (isEmpty([keyId, key])) {
      return res.status(400).json({
        status: "FAILED",
        message: "Missing key info"
      })
    }

    try {
      const resultKey = await KeyStore.findOneAndUpdate({ _id: keyId }, key, { new: true });
      if (key.status) {
        await FileStore.updateMany({ keyId, status: { $ne: STATUS.DEL_FILE } }, { status: key.status });
      }

      const log = new Log({
        time: Date.now(),
        userId: req.user._id,
        description: `${EVENT_TYPE.UPDATE_KEY} ${resultKey.alias}`
      });

      log.save();

      return res.status(200).json({
        status: "SUCCESS",
        data: {
          key: resultKey
        }
      })

    } catch (error) {
      return res.status(500).json({
        status: "FAILED",
        message: "Something's wrong"
      })
    }
  },

  store: async (req, res) => {
    const key = req.body.key;
    const userId = req.user._id;
    if (!key) {
      return res.status(400).json({
        status: "FAILED",
        message: "Missing key info"
      })
    }
    try {
      const cryptoKey = new CryptoKey(genCryptoKey());
      const savedkey = await cryptoKey.save();
      const status = "ENABLE";
      const creationDate = Date.now();
      const lastRotation = Date.now();
      const rotation = convertDateToMilis(key.rotation);
      const keyStore = KeyStore({
        ...key,
        status,
        creationDate,
        lastRotation,
        rotation,
        cryptoKeyId: savedkey._id
      });

      const resultKey = await keyStore.save();

      const { permissions } = key || null;
      const updatedPemission = { [userId]: [PERMISSION_TYPES.ALL_ACCESS], ...permissions };
      const usersArr = Object.keys(updatedPemission);
      await UserStore.updateMany({ _id: { $in: usersArr } }, { $push: { keyList: resultKey._id } })

      const log = new Log({
        time: Date.now(),
        userId,
        description: `${EVENT_TYPE.CREATE_KEY} ${key.alias}`
      });
      log.save();

      return res.status(200).json({
        status: "SUCCESS",
        data: {
          key: resultKey
        }
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "FAILED",
        message: "Something's wrong"
      })
    }
  },

  delete: async (req, res) => {
    const { keyId } = req.params;
    console.log(keyId);

    if (isEmpty(keyId)) {
      return res.status(400).json({
        status: "FAILED",
        message: "Missing key info"
      })
    }

    try {
      const key = await KeyStore.findOneAndDelete({ _id: keyId });
      const { permissions } = key;
      const usersArr = Object.keys(permissions);
      await UserStore.updateMany({ _id: { $in: usersArr } }, { $pull: { keyList: keyId } });

      const log = new Log({
        time: Date.now(),
        userId: key.owner,
        description: `${EVENT_TYPE.DEL_KEY} ${key.alias}`
      });

      await log.save();

      return res.status(200).json({
        status: "SUCCESS",
        data: {
          keyId
        }
      })

    } catch (error) {
      return res.status(500).json({
        status: "FAILED",
        message: "Something's wrong"
      })
    }
  },

  getByAlias: async (req, res) => {
    const keyAlias = req.params.keyAlias;

    if (isEmpty(keyAlias)) {
      return res.status(400).json({
        status: "FAILED",
        message: "Missing key alias"
      })
    }
    try {
      const key = await KeyStore.findOne({ alias: keyAlias });

      if (isEmpty(key)) {
        return res.status(400).json({
          status: "FAILED",
          message: "Key not found"
        })
      }

      return res.status(200).json({
        status: "SUCCESS",
        data: {
          key: key
        }
      })
    } catch (error) {
      return res.status(500).json({
        status: "FAILED",
        message: "Something's wrong"
      })
    }
  }
}

