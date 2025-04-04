<?php
/**
* Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.  See License in the project root for license information.
* 
* MobileAppContentFile File
* PHP version 7
*
* @category  Library
* @package   Microsoft.Graph
* @copyright (c) Microsoft Corporation. All rights reserved.
* @license   https://opensource.org/licenses/MIT MIT License
* @link      https://graph.microsoft.com
*/
namespace Microsoft\Graph\Model;

/**
* MobileAppContentFile class
*
* @category  Model
* @package   Microsoft.Graph
* @copyright (c) Microsoft Corporation. All rights reserved.
* @license   https://opensource.org/licenses/MIT MIT License
* @link      https://graph.microsoft.com
*/
class MobileAppContentFile extends Entity
{
    /**
    * Gets the azureStorageUri
    * The Azure Storage URI.
    *
    * @return string|null The azureStorageUri
    */
    public function getAzureStorageUri()
    {
        if (array_key_exists("azureStorageUri", $this->_propDict)) {
            return $this->_propDict["azureStorageUri"];
        } else {
            return null;
        }
    }

    /**
    * Sets the azureStorageUri
    * The Azure Storage URI.
    *
    * @param string $val The azureStorageUri
    *
    * @return MobileAppContentFile
    */
    public function setAzureStorageUri($val)
    {
        $this->_propDict["azureStorageUri"] = $val;
        return $this;
    }

    /**
    * Gets the azureStorageUriExpirationDateTime
    * The time the Azure storage Uri expires.
    *
    * @return \DateTime|null The azureStorageUriExpirationDateTime
    */
    public function getAzureStorageUriExpirationDateTime()
    {
        if (array_key_exists("azureStorageUriExpirationDateTime", $this->_propDict)) {
            if (is_a($this->_propDict["azureStorageUriExpirationDateTime"], "\DateTime") || is_null($this->_propDict["azureStorageUriExpirationDateTime"])) {
                return $this->_propDict["azureStorageUriExpirationDateTime"];
            } else {
                $this->_propDict["azureStorageUriExpirationDateTime"] = new \DateTime($this->_propDict["azureStorageUriExpirationDateTime"]);
                return $this->_propDict["azureStorageUriExpirationDateTime"];
            }
        }
        return null;
    }

    /**
    * Sets the azureStorageUriExpirationDateTime
    * The time the Azure storage Uri expires.
    *
    * @param \DateTime $val The azureStorageUriExpirationDateTime
    *
    * @return MobileAppContentFile
    */
    public function setAzureStorageUriExpirationDateTime($val)
    {
        $this->_propDict["azureStorageUriExpirationDateTime"] = $val;
        return $this;
    }

    /**
    * Gets the createdDateTime
    * The time the file was created.
    *
    * @return \DateTime|null The createdDateTime
    */
    public function getCreatedDateTime()
    {
        if (array_key_exists("createdDateTime", $this->_propDict)) {
            if (is_a($this->_propDict["createdDateTime"], "\DateTime") || is_null($this->_propDict["createdDateTime"])) {
                return $this->_propDict["createdDateTime"];
            } else {
                $this->_propDict["createdDateTime"] = new \DateTime($this->_propDict["createdDateTime"]);
                return $this->_propDict["createdDateTime"];
            }
        }
        return null;
    }

    /**
    * Sets the createdDateTime
    * The time the file was created.
    *
    * @param \DateTime $val The createdDateTime
    *
    * @return MobileAppContentFile
    */
    public function setCreatedDateTime($val)
    {
        $this->_propDict["createdDateTime"] = $val;
        return $this;
    }

    /**
    * Gets the isCommitted
    * A value indicating whether the file is committed.
    *
    * @return bool|null The isCommitted
    */
    public function getIsCommitted()
    {
        if (array_key_exists("isCommitted", $this->_propDict)) {
            return $this->_propDict["isCommitted"];
        } else {
            return null;
        }
    }

    /**
    * Sets the isCommitted
    * A value indicating whether the file is committed.
    *
    * @param bool $val The isCommitted
    *
    * @return MobileAppContentFile
    */
    public function setIsCommitted($val)
    {
        $this->_propDict["isCommitted"] = boolval($val);
        return $this;
    }

    /**
    * Gets the manifest
    * The manifest information.
    *
    * @return \AmeliaGuzzleHttp\Psr7\Stream|null The manifest
    */
    public function getManifest()
    {
        if (array_key_exists("manifest", $this->_propDict)) {
            if (is_a($this->_propDict["manifest"], "\AmeliaGuzzleHttp\Psr7\Stream") || is_null($this->_propDict["manifest"])) {
                return $this->_propDict["manifest"];
            } else {
                $this->_propDict["manifest"] = \AmeliaGuzzleHttp\Psr7\Utils::streamFor($this->_propDict["manifest"]);
                return $this->_propDict["manifest"];
            }
        }
        return null;
    }

    /**
    * Sets the manifest
    * The manifest information.
    *
    * @param \AmeliaGuzzleHttp\Psr7\Stream $val The manifest
    *
    * @return MobileAppContentFile
    */
    public function setManifest($val)
    {
        $this->_propDict["manifest"] = $val;
        return $this;
    }

    /**
    * Gets the name
    * the file name.
    *
    * @return string|null The name
    */
    public function getName()
    {
        if (array_key_exists("name", $this->_propDict)) {
            return $this->_propDict["name"];
        } else {
            return null;
        }
    }

    /**
    * Sets the name
    * the file name.
    *
    * @param string $val The name
    *
    * @return MobileAppContentFile
    */
    public function setName($val)
    {
        $this->_propDict["name"] = $val;
        return $this;
    }

    /**
    * Gets the size
    * The size of the file prior to encryption.
    *
    * @return int|null The size
    */
    public function getSize()
    {
        if (array_key_exists("size", $this->_propDict)) {
            return $this->_propDict["size"];
        } else {
            return null;
        }
    }

    /**
    * Sets the size
    * The size of the file prior to encryption.
    *
    * @param int $val The size
    *
    * @return MobileAppContentFile
    */
    public function setSize($val)
    {
        $this->_propDict["size"] = intval($val);
        return $this;
    }

    /**
    * Gets the sizeEncrypted
    * The size of the file after encryption.
    *
    * @return int|null The sizeEncrypted
    */
    public function getSizeEncrypted()
    {
        if (array_key_exists("sizeEncrypted", $this->_propDict)) {
            return $this->_propDict["sizeEncrypted"];
        } else {
            return null;
        }
    }

    /**
    * Sets the sizeEncrypted
    * The size of the file after encryption.
    *
    * @param int $val The sizeEncrypted
    *
    * @return MobileAppContentFile
    */
    public function setSizeEncrypted($val)
    {
        $this->_propDict["sizeEncrypted"] = intval($val);
        return $this;
    }

    /**
    * Gets the uploadState
    * The state of the current upload request. Possible values are: success, transientError, error, unknown, azureStorageUriRequestSuccess, azureStorageUriRequestPending, azureStorageUriRequestFailed, azureStorageUriRequestTimedOut, azureStorageUriRenewalSuccess, azureStorageUriRenewalPending, azureStorageUriRenewalFailed, azureStorageUriRenewalTimedOut, commitFileSuccess, commitFilePending, commitFileFailed, commitFileTimedOut.
    *
    * @return MobileAppContentFileUploadState|null The uploadState
    */
    public function getUploadState()
    {
        if (array_key_exists("uploadState", $this->_propDict)) {
            if (is_a($this->_propDict["uploadState"], "\Microsoft\Graph\Model\MobileAppContentFileUploadState") || is_null($this->_propDict["uploadState"])) {
                return $this->_propDict["uploadState"];
            } else {
                $this->_propDict["uploadState"] = new MobileAppContentFileUploadState($this->_propDict["uploadState"]);
                return $this->_propDict["uploadState"];
            }
        }
        return null;
    }

    /**
    * Sets the uploadState
    * The state of the current upload request. Possible values are: success, transientError, error, unknown, azureStorageUriRequestSuccess, azureStorageUriRequestPending, azureStorageUriRequestFailed, azureStorageUriRequestTimedOut, azureStorageUriRenewalSuccess, azureStorageUriRenewalPending, azureStorageUriRenewalFailed, azureStorageUriRenewalTimedOut, commitFileSuccess, commitFilePending, commitFileFailed, commitFileTimedOut.
    *
    * @param MobileAppContentFileUploadState $val The uploadState
    *
    * @return MobileAppContentFile
    */
    public function setUploadState($val)
    {
        $this->_propDict["uploadState"] = $val;
        return $this;
    }

}
