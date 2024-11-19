'use client'
import React, { useState, useEffect } from 'react';
import AppLayout from 'components/Applayout';
export default function PrivacyPolicy() {

    return (

        <AppLayout>
            <div className="flex flex-col">
                <h1 className="page-title pt-4 md:pt-2 text-2xl pb-1">Privacy and Policies</h1>
                <p>
                    This is a dummy Privacy and Policies page. You can replace this content
                    with your actual privacy and policy text in the future.
                </p>
            </div>
        </AppLayout>
    );
}
