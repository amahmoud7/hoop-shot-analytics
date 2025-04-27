
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

type CourtType = 'half' | 'full';

interface FormValues {
  courtType: CourtType;
}

const CourtSelection = () => {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      courtType: 'half',
    },
  });

  const onSubmit = (data: FormValues) => {
    // Store the selection in localStorage for future reference
    localStorage.setItem('courtType', data.courtType);
    navigate('/tracking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Court Selection" showBack={true} showMenu={false} />
      
      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-navy mb-6">Select Court Type</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="courtType"
                render={({ field }) => (
                  <FormItem className="space-y-6">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4"
                      >
                        <Label
                          htmlFor="half"
                          className="flex flex-col items-center gap-4 rounded-lg border-2 border-muted p-4 hover:bg-accent cursor-pointer [&:has([data-state=checked])]:border-basketball"
                        >
                          <RadioGroupItem value="half" id="half" className="sr-only" />
                          <div className="w-full h-40 bg-white rounded-lg border flex items-center justify-center">
                            {/* Half Court SVG Illustration */}
                            <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                              <rect x="10" y="50" width="80" height="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="50" cy="90" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <div className="text-center">
                            <h3 className="font-semibold">Half Court</h3>
                            <p className="text-sm text-muted-foreground">Perfect for practice or pickup games</p>
                          </div>
                        </Label>

                        <Label
                          htmlFor="full"
                          className="flex flex-col items-center gap-4 rounded-lg border-2 border-muted p-4 hover:bg-accent cursor-pointer [&:has([data-state=checked])]:border-basketball"
                        >
                          <RadioGroupItem value="full" id="full" className="sr-only" />
                          <div className="w-full h-40 bg-white rounded-lg border flex items-center justify-center">
                            {/* Full Court SVG Illustration */}
                            <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                              <rect x="10" y="5" width="80" height="90" fill="none" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="50" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="50" cy="90" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <div className="text-center">
                            <h3 className="font-semibold">Full Court</h3>
                            <p className="text-sm text-muted-foreground">For complete game tracking</p>
                          </div>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-basketball hover:bg-orange-600">
                Continue
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default CourtSelection;
