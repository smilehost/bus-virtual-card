import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const useSSE = () => {
    const { showToast } = useToast();

    useEffect(() => {
        // Hardcoded SSE endpoint as requested
        const sseUrl = 'http://localhost:8000/api/card/sse/3a5dd8f6cd2b8724fced331acd67a26339d74ac1a4a9ce787be4ed5cce622185';
        
        console.log(`[SSE] Connecting to ${sseUrl}...`);
        
        const eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
            console.log('[SSE] Connection opened');
        };

        // Listen for 'ready' event
        eventSource.addEventListener('ready', (event) => {
            console.log('[SSE] Ready event received:', event.data);
        });

        // Listen for 'card_used' named event
        eventSource.addEventListener('card_used', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('[SSE] Card used event received:', data);

                showToast({
                    type: 'success',
                    title: 'สแกนบัตรสำเร็จ!',
                    data: data
                });

            } catch (error) {
                console.error('[SSE] Error parsing card_used event:', error);
            }
        });


        eventSource.onerror = (error) => {
            console.error('[SSE] Error:', error);
        };

        return () => {
            console.log('[SSE] Closing connection');
            eventSource.close();
        };
    }, [showToast]);
};

export default useSSE;

