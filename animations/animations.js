import * as mat4 from '../js/lib/glmatrix/mat4.js'
import * as vec3 from '../js/lib/glmatrix/vec3.js'
import * as quat from '../js/lib/glmatrix/quat.js'

/**
 *  A keyframe that stores the position, rotation and scale of an object at a time stamp
 *  It's defines a definition that can be interpolated to.
 * 
 */
class Keyframe {
    /**
     * @param {float} timeStamp
     * @param {vec3} position
     * @param {quat} rotation
     */
    constructor(timeStamp, position, rotation)
    {
        this.timeStamp = timeStamp;
        this.position = position;
        this.rotation = rotation;
    }

    /**
     * Return a vector representing the translation of the object during delta_time to this keyframe
     * 
     * @param {float} currTime
     * @param {vec3} currObjPosition
     * @param {float} delta_time
     * 
     *  */
    getTranslationVec(currTime, currObjPosition, delta_time)
    {
        let remainingTime = this.timeStamp - currTime;
        if (remainingTime > 0)
        {
            let destDistance = vec3.create();
            vec3.subtract(destDistance, this.position, currObjPosition);
            vec3.scale(destDistance, destDistance, delta_time / remainingTime);
            return destDistance; 
        }
        else
        {
            return vec3.fromValues(0, 0, 0);
        }
    }

    /**
     * Return a vector representing the new position of the object after delta_time when heading to the keyframe
     * An alternative to getTranslationVec which return the inbetween vector
     * 
     * @param {float} currTime
     * @param {vec3} oldObjPosition
     * @param {float} delta_time
     * return new object position
     */
    getTranslationVec2(currTime, oldObjPosition, delta_time)
    {
        let remainingTime = this.timeStamp - currTime;
        if (remainingTime > 0)
        {
            let newObjPosition = vec3.create();
            vec3.lerp(newObjPosition, oldObjPosition, this.position, delta_time / remainingTime);
            return newObjPosition; 
        }  
        else
        {
            return oldObjPosition;
        }
    }
    
    /**
     * Returns a quat that represents the rotation of the object during delta_time to this keyframe
     * 
     * @param {float} currTime
     * @param {quat} currObjRotation 
     * @param {float} delta_time 
     * 
     */
    getRotationQuat(currTime, currObjRotation, delta_time)
    {
        let remainingTime = this.timeStamp - currTime;
        if (remainingTime > 0)
        {
            let newRotation = quat.create();
            quat.lerp(newRotation, currObjRotation, this.rotation, delta_time / remainingTime);
            return newRotation; 
        }
        else
        {
            return currObjRotation; // return identity quaternion
        }

    }
   
    /**
     * Check if this frame is coming up
     * 
     * @param {float} currTime 
     */
    isValid(currTime)
    {
        return currTime < this.timeStamp;
    }
}

/**
 * Represents animation for a specific node, contain all keyframe which TimeStamp are relative to the animation
 */
class Animation
{
    /**
     * @param {Array<Keyframe>} Keyframes
     * @param {float} totalDuration
     * @param {bool} loops
     */
    constructor(Keyframes, totalDuration, loops)
    {
        this.Keyframes = Keyframes;
        this.totalDuration = totalDuration;
        this.loops = loops;
        this.animationTime = 0.0;
        this.KeyFrameIndex = 0;
    }

    update(delta_time)
    {
        if (this.Keyframes != null)
        {
            this.animationTime += delta_time;
            if (!(this.Keyframes[this.KeyFrameIndex].isValid(this.animationTime)))
            {
                // if hasn't gone through the keyframes, and animation time isn't done
                // increment the keyframe
                if (this.KeyFrameIndex < this.Keyframes.length - 1)
                {
                    this.KeyFrameIndex++;
                }
                else if (this.loops)
                {
                    this.KeyFrameIndex = 0;
                    // animation time can be negative which is fine, because 
                    // we need negative times to interlope to the original keyframe if it loops
                    // and had a significant time between the last and first keyframe
                    this.animationTime = this.animationTime - this.totalDuration;
                }

            }
        }
            
    }

    /**
     * Return a vector representing the translation of the object during delta_time to this keyframe
     * 
     * @param {vec3} currObjPosition
     * @param {float} delta_time
     *
     */ 
    getTranslationVec(currObjPosition, delta_time)
    {
        if (this.Keyframes == null)
        {
            return new vec3(0,0,0);
        }
        return (this.Keyframes[this.KeyFrameIndex]).getTranslationVec(this.animationTime, currObjPosition, delta_time);
    }

    /**
     * An alternative method to getTranslationVec which returns a complete replacement for the previous vector 
     * Instead of a translation to add
     * 
     * Closer to how the get rotation work
     *  
     * @param {vec3} oldObjPosition
     * @param {float} delta_time
     */
    getTranslationVec2(oldObjPosition, delta_time)
    {
        if (this.Keyframes == null)
        {
            return oldObjPosition;
        }
        return (this.Keyframes[this.KeyFrameIndex]).getTranslationVec2(this.animationTime, oldObjPosition, delta_time);
    }

    /**
     * Return a rotational vector 
     *
     * @param {quat} currObjRotation
     * @param {float} delta_time
     *  
     */
    getRotationQuat(currObjRotation, delta_time)
    {
        if (this.Keyframes == null)
        {
            return currObjRotation;
        }
        return (this.Keyframes[this.KeyFrameIndex]).getRotationQuat(this.animationTime, currObjRotation, delta_time);
    }

    /**
     * This is alternative function which takes in a transform matrix and replaces with an interpolated matrix
     *
     * @param {readOnlyMat4} intialTransform
     * @param {float} delta_time 
     */
    getNewTransform(intialTransform, delta_time)
    {
        if (this.Keyframes == null)
        {
            return intialTransform;
        } 
        // grab rotation and translation components of original transform 
        let translation = vec3.create(); 
        mat4.getTranslation(translation, intialTransform); 
        let rotation = quat.create();
        mat4.getRotation(rotation, intialTransform);
        // apply lerp to both rotation and translation 
        let newRotation = this.getRotationQuat(rotation, delta_time);
        let newTranslation = this.getTranslationVec2(translation, delta_time);

        // create new final transform matrix from both of these components
        let finalTransform = mat4.create();
        mat4.fromRotationTranslation(finalTransform, newRotation, newTranslation);
        return finalTransform;
    }

}

export {
    Keyframe, Animation
}