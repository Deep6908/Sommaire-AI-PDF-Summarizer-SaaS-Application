'use client';

import { z } from 'zod';
import UploadFormInput from './upload_form_input';
import { file, refine } from 'zod/v4';
import { useUploadThing } from '@/utils/uploadthing';
import { toast } from "sonner" 
import { generatePdfSummary, storePdfSummaryAction } from '@/actions/upload_action';
import { useRef, useState } from 'react';
import { Router } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingSkeleton from './loading_skeleton';


const schema = z.object({
    file: z
    .instanceof(File, {message: 'Invalid file'})
    .refine(
        (file) => file.size <= 20 * 1024 * 1024, 
        'File size must be less than 20MB',
    )
    .refine(
        (file) => file.type.startsWith('application/pdf'),
        'File must be a PDF'
    ),
});

export default function UploadForm() {
    // Using toast directly from sonner import instead of useToast hook
    const formRef = useRef<HTMLFormElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { startUpload, routeConfig } = useUploadThing
    ('pdfUploader', {
        onClientUploadComplete: () => {
            console.log('Uploaded successfully!');
        },
        onUploadError: (err) => {
            console.error('Error occured while uploading', err);
            toast('Error occurred while uploading', {
                description: err.message,
            });
        },
        onUploadBegin: (fileNameOrId: string) => {
            console.log('Upload has begun for', fileNameOrId);
        },
    });

    const handleSubmit = async (e: React.
        FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        try{
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const file = formData.get('file') as File;

        //validating the fields
        const validatedFields = schema.safeParse({ file });

        console.log(validatedFields);

        if(!validatedFields.success)
        {
            toast('Something went wrong', {
                description: validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid file',
            });
            setIsLoading(false);
            return;
        }

        toast('Uploading PDF...', {
            description: 'We are uploading your PDF!'
        });

        //upload the file to uploadthing

        const resp = await startUpload([file]);
        if(!resp || resp.length === 0) {
            toast('Something went wrong', {
                description: 'Please use a different file'
            });
            setIsLoading(false);
            return;
        }
        toast('Processing PDF', {
            description: 'Hang tight! Our AI is reading through your document!'
        });
       // const uploadFileUrl = uploadResponse[0].serverData.fileUrl;


        //parse the pdf using langchain
        // The UploadThing response is an array of { serverData: { userId, fileUrl, fileName } }
        const result = await generatePdfSummary([resp[0]]);
        const { data = null, message = null } = result || {};

        if(data) {
            let storeResult: any;
            toast('Saving PDF...', {
                description: 'Hang tight! We are saving your summary!'
            });
         
           if(data.summary) {
            storeResult = await storePdfSummaryAction({
                summary: data.summary,
                fileUrl: resp[0].serverData.fileUrl,
                title: data.title,
                fileName: resp[0].serverData.fileName,
            });
            console.log('storeResult:', storeResult);

            if (storeResult.success && storeResult.data?.id) {
                toast('Summary Generated!', {
                    description: 'Your PDF has been successfully summarized and saved!'
                });
                formRef.current?.reset();
                router.push(`/summaries/${storeResult.data.id}`);
            } else {
                toast('Error saving summary', {
                    description: storeResult.message || 'Failed to save PDF summary to database.'
                });
            }
            }
        }
        } catch(error){
            setIsLoading(false);
            console.log('Error occurred', error);
            formRef.current?.reset();
        }  finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='flex flex-col gap-8 w-full max-w-2xl mx-auto'>
            <UploadFormInput 
            isLoading={isLoading} 
            ref={formRef} 
            onSubmit={handleSubmit} 
            />
            {isLoading && (
                <>
                    <div className='relative'>
                        <div
                            className='absolute inset-0 flex
                            items-center'
                            aria-hidden='true'
                            >
                                <div className='w-full border-t border-gray-200 dark:border-gray-800'/>
                            </div>
                            <div className='relative flex justify-center'>
                            </div>
                    </div>
                    <LoadingSkeleton />
                </>
            )}
        </div>
    );
}