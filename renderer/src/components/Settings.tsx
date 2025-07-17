// import { useState, useEffect } from "react";
// import { Button } from "./ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// import { Label } from "./ui/label";
// import { Switch } from "./ui/switch";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Input } from "./ui/input";
// import { Slider } from "./ui/slider";
// import { Separator } from "./ui/separator";
// import { Badge } from "./ui/badge";
// import { 
//   Settings as SettingsIcon, 
//   Grid3X3, 
//   Brain, 
//   Chrome, 
//   Monitor, 
//   Database,
//   Download,
//   Trash2,
//   AlertTriangle
// } from "lucide-react";

// interface SettingsState {
//   // Workspace Behavior
//   autoAddNewApps: boolean;
//   sessionTimeout: string;
//   trackedAppFilters: string[];
  
//   // AI Assistant
//   autoSummarizeInterval: string;
//   summaryDepth: string;
//   allowInlineSuggestions: boolean;
//   sendFeedback: boolean;
  
//   // Chrome & App Integration
//   browserProfile: string;
//   tabPersistence: string;
//   enableChromeControl: boolean;
//   appIconResolution: string;
  
//   // Overlay & HUD
//   overlayPlacement: string;
//   hudTransparency: number[];
//   showHudOnTrackedApps: boolean;
//   hotkeys: {

//     openNavigator: string;
//     openLauncher: string;
//     openIntelligence: string;
//     openUtilities: string;
//   };
  
//   // Session & Data
//   autohideBackgroundApps: boolean;
//   clearWorkspaceOnLaunch: boolean;
//   hideCortexHud: boolean;
// }

// const defaultSettings: SettingsState = {
//   autoAddNewApps: true,
//   sessionTimeout: "never",
//   trackedAppFilters: [],
//   autoSummarizeInterval: "off",
//   summaryDepth: "standard",
//   allowInlineSuggestions: false,
//   sendFeedback: false,
//   browserProfile: "Default",
//   tabPersistence: "keep",
//   enableChromeControl: true,
//   appIconResolution: "high",
//   overlayPlacement: "bottom-right",
//   hudTransparency: [20],
//   showHudOnTrackedApps: false,
//   hotkeys: {
    
//     openNavigator: "⌥ + Tab",
//     openLauncher: "⌥ + Return",
//     openIntelligence: "⌥ + Space",
//     openUtilities: "⌥ + U"
//   },
//   autohideBackgroundApps: false,
//   clearWorkspaceOnLaunch: false,
//   hideCortexHud: false
// };

// interface SettingsProps {
//   onBack: () => void;
// }

// export function Settings({ onBack }: SettingsProps) {
//   const [settings, setSettings] = useState<SettingsState>(defaultSettings);

//   useEffect(() => {
//     window.electron.getSettings?.().then((loaded) => {
//       if (loaded) setSettings(loaded);
//     });
//   }, []);


//   const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
//     setSettings(prev => ({ ...prev, [key]: value }));
//   };

//   const addTrackedApp = (app: string) => {
//     if (app && !settings.trackedAppFilters.includes(app)) {
//       updateSetting('trackedAppFilters', [...settings.trackedAppFilters, app]);
//     }
//   };

//   const removeTrackedApp = (app: string) => {
//     updateSetting('trackedAppFilters', settings.trackedAppFilters.filter(a => a !== app));
//   };

//   const exportSessionData = (format: 'json' | 'markdown') => {
//     console.log(`Exporting session data as ${format}`);
//   };

//   const deleteLocalData = () => {
//     if (confirm('Are you sure you want to delete all local session data? This cannot be undone.')) {
//       console.log('Deleting local session data');
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-8">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <Button variant="outline" onClick={onBack}>
//           ← Back
//         </Button>
//         <div className="flex items-center gap-3">
//           <SettingsIcon className="w-6 h-6 text-primary" />
//           <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
//         </div>
//       </div>

//       {/* Workspace Behavior */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Grid3X3 className="w-5 h-5 text-primary" />
//             Workspace Behavior
//           </CardTitle>
//           <CardDescription>
//             Configure how your workspace behaves and tracks applications
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label className="text-sm font-medium">Auto-add new apps</Label>
//               <p className="text-xs text-muted-foreground">Automatically track new applications when they open</p>
//             </div>
//             <Switch
//               checked={settings.autoAddNewApps}
//               onCheckedChange={(checked) => updateSetting('autoAddNewApps', checked)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Session timeout duration</Label>
//             <Select value={settings.sessionTimeout} onValueChange={(value) => updateSetting('sessionTimeout', value)}>
//               <SelectTrigger className="w-48">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="never">Never</SelectItem>
//                 <SelectItem value="5min">5 minutes</SelectItem>
//                 <SelectItem value="10min">10 minutes</SelectItem>
//                 <SelectItem value="30min">30 minutes</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-3">
//             <Label className="text-sm font-medium">Tracked app filters</Label>
//             <div className="flex flex-wrap gap-2 mb-2">
//               {settings.trackedAppFilters.map((app) => (
//                 <Badge key={app} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => removeTrackedApp(app)}>
//                   {app} ×
//                 </Badge>
//               ))}
//             </div>
//             <div className="flex gap-2">
//               <Input 
//                 placeholder="Add app filter (e.g., 'Figma')" 
//                 className="flex-1"
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter') {
//                     addTrackedApp(e.currentTarget.value);
//                     e.currentTarget.value = '';
//                   }
//                 }}
//               />
//               <Button variant="outline" size="sm">Add</Button>
//             </div>
//           </div>

//           <Separator />
          
//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label className="text-sm font-medium">Auto-hide background apps on launch</Label>
//               <p className="text-xs text-muted-foreground">Hide non-active apps when starting a new session</p>
//             </div>
//             <Switch
//               checked={settings.autohideBackgroundApps}
//               onCheckedChange={(checked) => updateSetting('autohideBackgroundApps', checked)}
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label className="text-sm font-medium">Clear workspace on launch</Label>
//               <p className="text-xs text-muted-foreground">Start with a clean workspace each time</p>
//             </div>
//             <Switch
//               checked={settings.clearWorkspaceOnLaunch}
//               onCheckedChange={(checked) => updateSetting('clearWorkspaceOnLaunch', checked)}
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label className="text-sm font-medium">Hide Cortex HUD</Label>
//               <p className="text-xs text-muted-foreground">Hide the overlay heads-up display</p>
//             </div>
//             <Switch
//               checked={settings.hideCortexHud}
//               onCheckedChange={(checked) => updateSetting('hideCortexHud', checked)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* AI Assistant & Summarization */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Brain className="w-5 h-5 text-primary" />
//             AI Assistant & Summarization
//           </CardTitle>
//           <CardDescription>
//             Configure AI-powered features and session summarization
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Auto-summarize session every X mins</Label>
//             <Select value={settings.autoSummarizeInterval} onValueChange={(value) => updateSetting('autoSummarizeInterval', value)}>
//               <SelectTrigger className="w-48">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="off">Off</SelectItem>
//                 <SelectItem value="5">5 minutes</SelectItem>
//                 <SelectItem value="15">15 minutes</SelectItem>
//                 <SelectItem value="30">30 minutes</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Summary depth</Label>
//             <div className="flex gap-2">
//               {['brief', 'standard', 'detailed'].map((depth) => (
//                 <Button
//                   key={depth}
//                   variant={settings.summaryDepth === depth ? 'default' : 'outline'}
//                   size="sm"
//                   onClick={() => updateSetting('summaryDepth', depth)}
//                   className="capitalize"
//                 >
//                   {depth}
//                 </Button>
//               ))}
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label className="text-sm font-medium">Allow inline AI suggestions</Label>
//               <p className="text-xs text-muted-foreground">Show contextual AI suggestions while working</p>
//             </div>
//             <Switch
//               checked={settings.allowInlineSuggestions}
//               onCheckedChange={(checked) => updateSetting('allowInlineSuggestions', checked)}
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label className="text-sm font-medium">Send feedback to improve AI</Label>
//               <p className="text-xs text-muted-foreground">Help improve AI suggestions by sharing usage data</p>
//             </div>
//             <Switch
//               checked={settings.sendFeedback}
//               onCheckedChange={(checked) => updateSetting('sendFeedback', checked)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Chrome & App Integration */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Chrome className="w-5 h-5 text-primary" />
//             Chrome & App Integration
//           </CardTitle>
//           <CardDescription>
//             Configure browser and application integration settings
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Preferred browser profile</Label>
//             <Input 
//               value={settings.browserProfile}
//               onChange={(e) => updateSetting('browserProfile', e.target.value)}
//               placeholder="Profile name (e.g., 'Default', 'Profile 2')"
//               className="w-64"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Tab persistence mode</Label>
//             <div className="flex gap-2">
//               {[
//                 { value: 'keep', label: 'Keep tabs' },
//                 { value: 'fresh', label: 'Start fresh' }
//               ].map((option) => (
//                 <Button
//                   key={option.value}
//                   variant={settings.tabPersistence === option.value ? 'default' : 'outline'}
//                   size="sm"
//                   onClick={() => updateSetting('tabPersistence', option.value)}
//                 >
//                   {option.label}
//                 </Button>
//               ))}
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label className="text-sm font-medium">Enable advanced Chrome control (CDP)</Label>
//               <p className="text-xs text-muted-foreground">Use Chrome DevTools Protocol for enhanced control</p>
//             </div>
//             <Switch
//               checked={settings.enableChromeControl}
//               onCheckedChange={(checked) => updateSetting('enableChromeControl', checked)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label className="text-sm font-medium">App icon resolution</Label>
//             <Select value={settings.appIconResolution} onValueChange={(value) => updateSetting('appIconResolution', value)}>
//               <SelectTrigger className="w-48">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="fast">Fast</SelectItem>
//                 <SelectItem value="high">High quality</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Overlay & HUD Settings */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Monitor className="w-5 h-5 text-primary" />
//             Overlay & HUD Settings
//           </CardTitle>
//           <CardDescription>
//             Configure the heads-up display and overlay behavior
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Overlay placement</Label>
//             <Select value={settings.overlayPlacement} onValueChange={(value) => updateSetting('overlayPlacement', value)}>
//               <SelectTrigger className="w-48">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="bottom-right">Bottom-right</SelectItem>
//                 <SelectItem value="bottom-left">Bottom-left</SelectItem>
//                 <SelectItem value="floating">Floating</SelectItem>
//                 <SelectItem value="docked">Docked</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-3">
//             <Label className="text-sm font-medium">HUD transparency</Label>
//             <div className="px-3">
//               <Slider
//                 value={settings.hudTransparency}
//                 onValueChange={(value) => updateSetting('hudTransparency', value)}
//                 max={100}
//                 step={5}
//                 className="w-64"
//               />
//               <div className="flex justify-between text-xs text-muted-foreground mt-1">
//                 <span>0% (Opaque)</span>
//                 <span className="font-medium">{settings.hudTransparency[0]}%</span>
//                 <span>100% (Transparent)</span>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label className="text-sm font-medium">Show HUD only on tracked apps</Label>
//               <p className="text-xs text-muted-foreground">Hide HUD when using non-tracked applications</p>
//             </div>
//             <Switch
//               checked={settings.showHudOnTrackedApps}
//               onCheckedChange={(checked) => updateSetting('showHudOnTrackedApps', checked)}
//             />
//           </div>

//           <div className="space-y-4">
//       <Label className="text-sm font-medium">Quick toggle hotkeys</Label>
//       <div className="space-y-3">
//         {Object.entries(settings.hotkeys).map(([key, value]) => {
//           const [editingKey, setEditingKey] = useState<string | null>(null);
//           const isRecording = editingKey === key;

//           const handleKeyDown = (e: React.KeyboardEvent) => {
//             e.preventDefault();
//             e.stopPropagation();

//             if (e.key === "Escape") {
//               setEditingKey(null);
//               return;
//             }

//             const keys = [];
//             if (e.metaKey) keys.push("⌘");
//             if (e.ctrlKey) keys.push("⌃");
//             if (e.altKey) keys.push("⌥");
//             if (e.shiftKey) keys.push("⇧");

//             const printableKey =
//               e.key.length === 1 ? e.key.toUpperCase() : formatKeyName(e.key);
//             keys.push(printableKey);

//             const recorded = keys.join(" + ");
//             updateSetting("hotkeys", {
//               ...settings.hotkeys,
//               [key]: recorded,
//             });
//             setEditingKey(null);
//           };

//           return (
//             <div key={key} className="flex items-center justify-between">
//               <div className="w-48">
//                 <Label className="text-sm capitalize">
//                   {key.replace(/([A-Z])/g, " $1").toLowerCase()}
//                 </Label>
//               </div>
//               {isRecording ? (
//                 <div
//                   tabIndex={0}
//                   className="w-32 text-center font-mono py-2 px-3 rounded-md border bg-muted outline-none"
//                   onKeyDown={handleKeyDown}
//                 >
//                   Recording...
//                 </div>
//               ) : (
//                 <div
//                   className="w-32 text-center font-mono py-2 px-3 rounded-md border cursor-pointer hover:bg-muted"
//                   onClick={() => setEditingKey(key)}
//                 >
//                   {value}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   </CardContent>
// </Card>

//       {/* Session & Data */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Database className="w-5 h-5 text-primary" />
//             Session & Data
//           </CardTitle>
//           <CardDescription>
//             Manage your session data and export options
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="space-y-3">
//             <Label className="text-sm font-medium">Export session history</Label>
//             <div className="flex gap-3">
//               <Button variant="outline" onClick={() => exportSessionData('json')}>
//                 <Download className="w-4 h-4 mr-2" />
//                 Download JSON
//               </Button>
//               <Button variant="outline" onClick={() => exportSessionData('markdown')}>
//                 <Download className="w-4 h-4 mr-2" />
//                 Download Markdown
//               </Button>
//             </div>
//           </div>

//           <Separator />

//           <div className="space-y-3">
//             <div className="flex items-center gap-2">
//               <AlertTriangle className="w-4 h-4 text-destructive" />
//               <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
//             </div>
//             <Button variant="destructive" onClick={deleteLocalData}>
//               <Trash2 className="w-4 h-4 mr-2" />
//               Delete local session data
//             </Button>
//             <p className="text-xs text-muted-foreground">
//               This will permanently delete all locally stored session data. This action cannot be undone.
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Save Settings */}
//       <div className="flex justify-end pt-6">
//         <Button onClick={() => {
//           console.log('Settings saved:', settings);
//           window.electron.saveSettings?.(settings);
//         }}>
//           Save Settings
//         </Button>
//       </div>
//     </div>
//   );
// }

import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <AlertTriangle className="w-10 h-10 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Settings Coming Soon</h1>
      <p className="text-muted-foreground mb-6">
        This feature is still under construction. We’re working hard to bring it to you!
      </p>
      <Button variant="outline" onClick={onBack}>
        ← Back
      </Button>
    </div>
  );
}