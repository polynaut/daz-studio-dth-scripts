# daz-studio-dth-scripts

A collection of scripts for Daz Studio and DTH

> Open the script with an editor of your choice: Notepad++, VSCcode or just any text editor you find on your machine. What can help too is the Daz Studio `Script IDE` (Windows -> Panes -> Script IDE).

> VSCode users can add a new entry in `file associations` for `\*.dsa` files with the language `javascript` to get syntax highlighting.

## Setup

Easiest way is to clone the entire repository in the `Scripts` folder of your Daz3D installation.

- Locate your `My DAZ 3D Library` folder on hour harddrive, in my case it is `D:\DAZ 3D\My DAZ 3D Library`
- Within thid folder, you will find a `Scripts` subfolder.
- Now open a terminal of your liking, navigate to this folder `D:\DAZ 3D\My DAZ 3D Library\Scripts` and execute `git clone git@github.com:polynaut/daz-studio-dth-scripts.git`, this will create copy of the entire repository in your scripts folder
- Start Daz3D Studio (or restart it), and you will find all the scripts in your `Content Library`

## DTH Workflow

The file `dthWorkflow.dsa` is the main script you want to use. It is a "one-click" solution for all aspects of DTH:

- Applying the JCM pose asset(s) of your liking (Genesis 8.1 or Genesis 9)
- Giving the ability to add additional morphs on JCM frames based on bending angles of certain bones.
- Extending the timeline with EXP, GEN and FBM morphs - generated "on-the-fly" without pose asset files. Just how you define them.

To use it properly, you must edit the following settings. Open the script with any text editor (i recommend VSCode) and edit:

### Options

```javascript
var options = {
  // Path to your daz studio library, always use "/" as the path separator, on mac and windows
  sPathDazLibrary: "D:/DAZ 3D/My DAZ 3D Library/",
  genesisVersion: 8.1, // 8.1 or 9
  // Set true to include the FAC version of the ROM
  bIncludeFAC: true,
  bIncludeDK: false,
  bIncludeGP: true,
  bDQS: true, // set true to enable Dual Quaternion Skinning, defaults to Linear
  FACsDetailStrength: 1.0, // only used for G9
  FlexionStrength: 1.0, // only used for G9
  // Offsets for the fence poses, relative to the first frame of the GP ROM file
  aGPFenceOffsets: [0, 73, 77, 80],
  // Offsets for the fence poses, relative to the first frame of the DK ROM file
  // Ex. The standard offsets as of DTH 1.6.6:
  aDKFenceOffsets: [0, 33, 46, 47, 49, 52],
  //   oMISConfig: {
  //     nodeName: "Genesis 8 Female Genitalia",
  //     morphConfigs: [
  //       { type: "modifier", name: "OpenDeep", value: 1 },
  //       { type: "modifier", name: "Biglips", value: 1 },
  //     ],
  //   },
};
```

After setting up the options, you will also find an import for a file called `include(dir_self.filePath("morphAnimationConfigs/laraG81.dsa"));`. Copy this file for your specific character and adjust all arrays of different morphs like EXP, GEN and FBM.

The provided file will generate my personal "Lara Croft" character which is based on Genesis 8.1, including a full pose asset with Golden Palace 8.1

// TODO: add morph list for Golden Palace 9

### Import of Morph Settings

## Script `fullBodyMorphAnim`

This script can add keyframes to your timeline with a specific set of morphs that can be applied for DTH `Full Body Morphs (FBM)` category. It will automatically zero out all morphs on all involved frames and thus will always create an extra frame at the end where everything is zeroed out again.

At the beginning of the script is a simple array with all morphs you want to apply, something like:

```javascript
var morphConfigs = [
  // Single morph
  { type: "morph", name: "GC BodyMorph", value: 1 },

  // Negative values are also valid
  { type: "morph", name: "PBMWaistWidth", value: -1 },

  // You can link multiple morphs on the same frame
  [
    { type: "morph", name: "PBMBreastsImplantsL", value: 1 },
    { type: "morph", name: "PBMBreastsImplantsR", value: 1 },
  ],

  // You can use values greater than 1 (this would be 150%)
  { type: "morph", name: "PBMBreastsDiameter", value: 1.5 },

  // Optionally specify a reset value (defaults to 0 if not provided)
  { type: "morph", name: "CTRLBreastsNatural", value: 1, reset: -1 },
];
```

### Morph names

To know how a morph is actually named internally, you can use the `Parameter Settings` in the UI of Daz Studio:

![parameter-settings-01](https://github.com/user-attachments/assets/58a5e27d-3d05-44be-9c60-1ccf36624607)

Just grab the name value there and use that for your script configuration.

![parameter-settings-02](https://github.com/user-attachments/assets/1695e8ad-4289-4bcd-ad83-b1fd507fae29)

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
    XRotate: {
      // Now you can define a list of morphs for positive bending angels that should be applied
      positive: [
        {
          morphName: "Rotation LEG LEFT Walk Backward Fix",
          range: {
            angle: {
              start: 0,
              // Insert the maximum value you could find in the JCM ROM animation
              // for this bone's XRotate positive value (use the analyzeKeyframesOfNode script)
              end: 37.5,
            },
            value: {
              start: 0,
              end: 0.3, // Choose how strong the morph should be applied, here it will be 30% on a bending angle of 37.5
            },
          },
        },
        {
          morphName: "!Hip Bend Controller",
          range: {
            angle: {
              start: 0,
              end: 37.5,
            },
            value: {
              start: 1, // We can also activate morphs the "whole time", the Hip Bend Controller is dynamic on it's own
              end: 1,
            },
          },
        },
      ],
      negative: [
        {
          morphName: "Rotation LEG LEFT Walk Forward Fix",
          range: {
            angle: {
              start: 0,
              end: -115,
            },
            value: {
              start: 0,
              end: 1,
            },
          },
        },
      ],
    },
  },
};
```

With the example configuration in place, the script will go trough the existing timeline of your JCM ROM animation and it will:

- Find the frames that needs to be modified, based on the bone name, rotation axis and value (> 0)
- Applies all defined morphs of the list of positive or negative morphs, based on the current angle
- Automatically resets all morphs on the frames "around" to 0 again to fight the default interplotation of daz

## Credits

These scripts where made with help of https://claude.ai, and https://github.com/soltude/DazToHue-Scripts ❤️
