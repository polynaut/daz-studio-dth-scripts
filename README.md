# daz-studio-dth-scripts
A collection of scripts for Daz Studio and DTH

Open the script with an editor of your choice: Notepad++, VSCcode or just any text editor you find on your machine. What can help too is the Daz Studio `Script IDE` (Windows -> Panes -> Script IDE).

## Script `fullBodyMorphAnim`

This script can add keyframes to your timeline with a specific set of morphs that can be applied for DTH `Full Body Morphs (FBM)` category. It will automatically zero out all morphs on all involved frames and thus will always create an extra frame at the end where everything is zeroed out again.

 At the beginning of the script is a simple array with all morphs you want to apply, something like:

```javascript
var morphConfigs = [
  "GC BodyMorph:1", // daz works with 0-1, so 1 means 100%
  "Center Gap Width:-1", // negative values are also valid
  ["FBMBodyTone:1", "Torso Muscular:1"], // you can link two morphs on the same frame
  "PBMWaistWidth:1.5" // you can also use values greater than 1, this would be 150%
];
```

### Morph names

To know how a morph is actually named internally, you can use the `Parameter Settings` in the UI of Daz Studio:

![parameter-settings-01](https://github.com/user-attachments/assets/bcc5a5d5-bebd-4751-8b29-12c3b67e8622)

Just grab the name value there and use that for your script configuration.

![parameter-settings-02](https://github.com/user-attachments/assets/6c28c802-d1b3-4c3f-be97-493e2b2616b1)

## Script `addFaceMorphAnim`

Does basically the same like `fullBodyMorphAnim` but with a set of `Facial Expressions (EXP)`. You can have as many copies of these script as you like to cover the various categories of DTH.

## Script `analyzeKeyframesOfNode`

This script can analyze all available keyframes of a specific bone and will print out a list of keyframes and the applied values/angles of the bone on this keyframe. 
This is helpful to setup a configuration for `modifyJcmRom`.

The script has a variable at the beginning:
```javascript
var TARGET_NODE = "Left Thigh Bend"; // Change this to filter for specific node/bone
```

To exectue the script, right click on it in `Content Library -> DAZ Studio Formats -> My DAZ Library -> Scripts` and hit `Open in Script IDE`. Then in the Script IDE, hit `Execute` on top right. This is necessary to see the output log of the script.

As example, after applying a JCM ROM preset to your character and you execute it for `Left Thigh Bend`, you will see an output like this:

```bash
Executing Script...
Timeline Analysis:
Filtering for node: Left Thigh Bend
Start Frame: 0
End Frame: 187
Time Step: 160
----------------------------------------
Node: Left Thigh Bend
  Property: XTranslate
    Frame 0: 0.0000 (TCB)
  Property: YTranslate
    Frame 0: 0.0000 (TCB)
  Property: ZTranslate
    Frame 0: 0.0000 (TCB)
  Property: XRotate
    Frame 0: 0.0000 (Linear)
    Frame 2: 0.0000 (Linear)
    Frame 3: 0.0000 (Linear)
    Frame 8: 0.0000 (Linear)
    Frame 9: -57.0000 (Linear)
    Frame 10: -115.0000 (Linear)
    Frame 11: 35.0000 (Linear)
    Frame 12: 0.0000 (Linear)
    Frame 13: -115.0000 (Linear)
    Frame 14: 0.0000 (Linear)
    Frame 100: 0.0000 (Linear)
  Property: YRotate
    Frame 0: 0.0000 (TCB)
  Property: ZRotate
    Frame 0: 0.0000 (Linear)
    Frame 1: -3.8000 (Linear)
    Frame 2: -8.0000 (Linear)
    Frame 3: 0.0000 (Linear)
    Frame 11: 0.0000 (Linear)
    Frame 12: 85.0000 (Linear)
    Frame 13: 85.0000 (Linear)
    Frame 14: 0.0000 (Linear)
    Frame 100: 0.0000 (Linear)
...
----------------------------------------
Total keyframes found for Left Thigh Bend: 47
Result: 
Script executed in 0 secs 30 msecs.
```

Now you can see that the left thigh is bent on the x axis at frame 9, 10, 11 and again on frame 13. The maximum angle is 35 for positive values, -115 for negative values.

With this information, we can proceed to setup the `modifyJcmRom` script.

## Script `modifyJcmRom`

Let's see an example configuration first:
```javascript
var morphConfig = {
    // First you assign a bone by name, in this example we want to apply morphs based on the bending of the left thigh
    "Left Thigh Bend": {
        // Next we choose an axis like "XRotate", "YRotate" or "ZRotate"
        "XRotate": {
           // Now you can define a list of morphs for positive bending angels that should be applied
        	 "positive": [{
                "morphName": "Rotation LEG LEFT Walk Backward Fix",
                "range": {
                    "angle": {
                        "start": 0,
                        // Insert the maximum value you could find in the JCM ROM animation
                        // for this bone's XRotate positive value (use the analyzeKeyframesOfNode script)
                        "end": 37.5
                    },
                    "value": {
                        "start": 0,
                        "end": 0.3 // Choose how strong the morph should be applied, here it will be 30% on a bending angle of 37.5
                    }
                }
            }, {
                "morphName": "!Hip Bend Controller",
                "range": {
                    "angle": {
                        "start": 0,
                        "end": 37.5
                    },
                    "value": {
                        "start": 1, // We can also activate morphs the "whole time", the Hip Bend Controller is dynamic on it's own
                        "end": 1
                    }
                }
            }],
            "negative": [{
                "morphName": "Rotation LEG LEFT Walk Forward Fix",
                "range": {
                    "angle": {
                        "start": 0,
                        "end": -115
                    },
                    "value": {
                        "start": 0,
                        "end": 1
                    }
                }
            }]
        }
    }
};
```

With the example configuration in place, the script will go trough the existing timeline of your JCM ROM animation and it will:
* Find the frames that needs to be modified, based on the bone name, rotation axis and value (> 0)
* Applies all defined morphs of the list of positive or negative morphs, based on the current angle
* Automatically resets all morphs on the frames "around" to 0 again to fight the default interplotation of daz

## Use the scripts

After you have finished the configuration of your script, save it to `My DAZ Library/Scripts` with any name and the file extension `.dsa`. After a restart of Daz Studio, you can easily find the script in the `Content Library` tab in the `Scripts` folder and by double clicking it, you will execute it.

⚠️ Attention!

The scripts can take a few minutes to execute!

💡 Good to know

- The script language of Daz Studio is based on javascript.
- You can copy paste a script into the Script IDE of Daz Studio to get a console output on execute.