'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useShortcuts } from '@/contexts/ShortcutsContext';
import { ShortcutEditor } from '@/components/shortcut-editor';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsDialog = ({ isOpen, onClose }: ShortcutsDialogProps) => {
  const { shortcuts, updateShortcut, resetShortcut, resetAllShortcuts } = useShortcuts();
  const [activeTab, setActiveTab] = useState<string>('view');

  // Group shortcuts by category
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));
  const shortcutsByCategory = categories.reduce((acc, category) => {
    acc[category] = shortcuts.filter(s => s.category === category);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="view">View Shortcuts</TabsTrigger>
            <TabsTrigger value="edit">Edit Shortcuts</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            <ScrollArea className="h-[50vh] pr-4">
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-medium mb-2">{category}</h3>
                  <div className="space-y-2">
                    {shortcutsByCategory[category].map(shortcut => (
                      <div key={shortcut.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{shortcut.name}</p>
                          <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                        </div>
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                          {shortcut.currentKeys.split('+').map((key, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="text-xs">+</span>}
                              <span className="text-xs">{key}</span>
                            </React.Fragment>
                          ))}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            <ScrollArea className="h-[50vh] pr-4">
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-medium mb-2">{category}</h3>
                  <div className="space-y-2">
                    {shortcutsByCategory[category].map(shortcut => (
                      <ShortcutEditor
                        key={shortcut.id}
                        shortcut={shortcut}
                        onUpdate={updateShortcut}
                        onReset={resetShortcut}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="flex justify-between pt-2 border-t">
              <Button variant="outline" onClick={() => setActiveTab("view")}>
                Back to View
              </Button>
              <Button variant="destructive" onClick={resetAllShortcuts}>
                Reset All Shortcuts
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
