'use client'
import { useEffect, useState } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';
export default function AppLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        // Custom "nice select" functionality
        const selects = document.querySelectorAll('select');
    
        selects.forEach((select) => {
            console.log('select',select)
          const wrapper = document.createElement('div');
          wrapper.className = 'custom-select-wrapper';
    
          const styledSelect = document.createElement('div');
          styledSelect.className = 'custom-select';
          styledSelect.innerText = select.options[select.selectedIndex].text;
    
          const dropdown = document.createElement('ul');
          dropdown.className = 'custom-select-dropdown';
    
          Array.from(select.options).forEach((option) => {
            const listItem = document.createElement('li');
            listItem.innerText = option.text;
    
            listItem.addEventListener('click', () => {
              select.value = option.value;
              styledSelect.innerText = option.text;
              dropdown.classList.remove('visible');
            });
    
            dropdown.appendChild(listItem);
          });
    
          styledSelect.addEventListener('click', () => {
            dropdown.classList.toggle('visible');
          });
    
          wrapper.appendChild(styledSelect);
          wrapper.appendChild(dropdown);
          select.style.display = 'none';
          select.parentNode.insertBefore(wrapper, select);
        });
    
        // Cleanup (if required)
        return () => {
          const wrappers = document.querySelectorAll('.custom-select-wrapper');
          wrappers.forEach((wrapper) => wrapper.remove());
        };
      }, []);

    return (
        <>
            <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="dashboard-outer flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar } />
                <div className='dashboard-right relative w-full transition ease-in-out delay-150'>
                    <div className='dashboard-inner min-h pt-[20px] p-[20px] xl:p-[40px] md:pt-[30px]'>
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}
