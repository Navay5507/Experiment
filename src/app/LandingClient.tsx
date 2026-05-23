"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from "framer-motion";
import { MessageCircle, Zap, ShieldCheck, ArrowRight, MousePointer2, Sparkles, RefreshCcw, Database, Tv, AtSign, Heart, Video, HandMetal, Send, Infinity as InfinityIcon, CheckCircle2, Loader2, Plus, Menu, X, ChevronDown, ShoppingBag } from "lucide-react";
import styles from "./page.module.css";
import ThemeToggle from "./components/ThemeToggle";

// Dynamic Feature Toggle: Set to false to immediately revert the landing page to the original layout
const USE_NOOB_FRIENDLY_HERO = true;
const USE_NOOB_FRIENDLY_FEATURES = true;

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <div>
    {children}
  </div>
);

const HeroMockupElement = () => (
            <FadeIn delay={0.4}>
              <div className={styles.heroMockupContainer}>
                
                <motion.div 
                   animate={{ rotateY: [-5, 5, -5], rotateX: [2, -2, 2], y: [0, -10, 0] }} 
                   transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                   style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 5, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   
                   <HeroUseCases />

                </motion.div>

                <motion.div 
                   animate={{ y: [100, -200], opacity: [0, 0.95, 0] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className={styles.ambientBubbleLeft}>
                   &quot;Send me the link! 😍&quot;
                </motion.div>
                <motion.div 
                   animate={{ y: [150, -150], opacity: [0, 0.95, 0] }} 
                   transition={{ duration: 4.5, delay: 1.5, repeat: Infinity, ease: "linear" }}
                   className={styles.ambientBubbleRight}>
                   &quot;price pls&quot;
                </motion.div>
                <motion.div 
                   animate={{ y: [80, -180], opacity: [0, 0.95, 0] }} 
                   transition={{ duration: 5, delay: 0.8, repeat: Infinity, ease: "linear" }}
                   className={styles.ambientBubbleTopLeft}>
                   &quot;DESK&quot;
                </motion.div>
                <motion.div 
                   animate={{ y: [120, -120], opacity: [0, 0.95, 0] }} 
                   transition={{ duration: 4.2, delay: 2.5, repeat: Infinity, ease: "linear" }}
                   className={styles.ambientBubbleTopRight}>
                   &quot;details? 🔥&quot;
                </motion.div>

                <motion.div
                   animate={{ scale: [0.8, 1, 0.8], opacity: [0, 0.95, 0], y: [-20, -40, -20] }}
                   transition={{ duration: 3, delay: 2, repeat: Infinity, ease: "easeInOut" }}
                   className={`${styles.ambientDmPopup} glass-panel`}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)'}}/>
                      <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>DM Delivered</span>
                   </div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&quot;Here is your exclusive link: https://drop.site 🚀&quot;</div>
                </motion.div>

              </div>
            </FadeIn>
);

const CountUpMetric = ({ target, prefix = '', suffix = '', decimals = 0 }: { target: number, prefix?: string, suffix?: string, decimals?: number }) => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: false, amount: 0.5 });
   const [val, setVal] = useState(0);

   useEffect(() => {
      if (isInView) {
         setVal(0);
         let current = 0;
         const inc = target / 40; 
         const interval = setInterval(() => {
            current += inc;
            if (current >= target) {
               current = target;
               clearInterval(interval);
            }
            setVal(current);
         }, 40);
         return () => clearInterval(interval);
      } else {
         setVal(0);
      }
   }, [isInView, target]);

   return <span ref={ref}>{prefix}{val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>
};

const Typewriter = ({ text }: { text: string }) => {
   const [display, setDisplay] = useState('');
   useEffect(() => {
     let i = 0;
     const int = setInterval(() => {
        setDisplay(text.substr(0, i+1));
        i++;
        if (i === text.length) clearInterval(int);
     }, 100); 
     return () => clearInterval(int);
   }, [text]);
   return <span style={{color:'#fff'}}>{display}<motion.span animate={{opacity:[1,0]}} transition={{repeat:Infinity, duration:0.4}}>|</motion.span></span>;
}

const UI_Step1 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0); 

   useEffect(() => {
       let isActive = true;
       const run = async () => {
           while(isActive) {
               setStep(0);
               await new Promise(r => setTimeout(r, 1000));
               if(!isActive) break;
               setStep(1); // Cursor hovers
               await new Promise(r => setTimeout(r, 600));
               if(!isActive) break;
               setStep(2); // Clicks
               await new Promise(r => setTimeout(r, 200));
               if(!isActive) break;
               setStep(3); // Loading
               await new Promise(r => setTimeout(r, 1500));
               if(!isActive) break;
               setStep(4); // Connected!
               await new Promise(r => setTimeout(r, 3500));
           }
       };
       run();
       return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', width:'100%', maxWidth:'400px'}}>
         <motion.div 
            animate={{ 
               x: step === 0 ? 120 : 0, 
               y: step === 0 ? 150 : 20, 
               scale: step === 2 ? 0.8 : 1,
               opacity: step >= 3 ? 0 : 1 
            }} 
            transition={{ duration: step === 0 ? 0 : 0.5 }}
            style={{ position:'absolute', top:'10%', right:'30%', zIndex:10 }}
         >
            <MousePointer2 size={24} fill="#fff" color="#000" />
         </motion.div>

         <div style={{position:'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width:'100%', height:'120px'}}>
            <AnimatePresence mode="wait">
               {step <= 2 ? (
                  <motion.div key="btn" initial={{opacity:0}} animate={{opacity:1, scale: step===1 ? 1.05 : step===2 ? 0.95 : 1}} exit={{opacity:0, scale:0.8}} style={{background:'#3b82f6', color:'#fff', padding:'1rem 2rem', borderRadius:'100px', fontWeight:600, display:'flex', alignItems:'center', gap:'0.5rem', boxShadow: step===1 ? '0 10px 20px rgba(59,130,246,0.4)': 'none', zIndex: 5}}>
                     Connect Instagram
                  </motion.div>
               ) : (
                  <motion.div key="loader" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} style={{width: 80, height: 80, borderRadius:'50%', background: step === 4 ? '#10b981' : 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 5}}>
                     {step === 3 ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{display: 'flex'}}>
                           <Loader2 size={40} color="#fff" />
                        </motion.div>
                     ) : (
                        <MessageCircle size={40} color="#fff" />
                     )}
                  </motion.div>
               )}
            </AnimatePresence>

            {step === 4 && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{position:'absolute', bottom:10, right: '35%', background:'#10b981', borderRadius:'50%', border:'3px solid #000', padding:'4px', zIndex: 6}}>
                  <CheckCircle2 size={16} color="#fff" strokeWidth={3} />
               </motion.div>
            )}
         </div>

         <div style={{textAlign:'center', height: '60px'}}>
            <div style={{fontSize:'1.2rem', fontWeight:600, color:'#fff'}}>{step <= 2 ? 'Connect with Meta' : step === 3 ? 'Authenticating...' : 'Instagram Connected'}</div>
            <div style={{fontSize:'0.9rem', color: step === 4 ? '#10b981' : '#888'}}>{step <= 2 ? '1-click secure connect' : step === 3 ? 'Talking to Meta API' : 'Active & Listening'}</div>
         </div>
      </div>
   );
};

const UI_Step2 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0);

   useEffect(() => {
       let isActive = true;
       const run = async () => {
          while (isActive) {
             setStep(0);
             await new Promise(r => setTimeout(r, 1000));
             if(!isActive) break;
             setStep(1); // Typing pricing
             await new Promise(r => setTimeout(r, 1500));
             if(!isActive) break;
             setStep(2); // Badge pricing
             await new Promise(r => setTimeout(r, 800));
             if(!isActive) break;
             setStep(3); // Typing link
             await new Promise(r => setTimeout(r, 1500));
             if(!isActive) break;
             setStep(4); // Badge link
             await new Promise(r => setTimeout(r, 600));
             if(!isActive) break;
             setStep(5); // Complete
             await new Promise(r => setTimeout(r, 4000));
          }
       };
       run();
       return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', gap:'1.5rem'}}>
         <div style={{background:'#16181D', border:'1px solid #2A2D35', borderRadius:'12px', padding:'1.5rem'}}>
            <div style={{fontSize:'0.85rem', color:'#888', marginBottom:'0.5rem'}}>If User comments any of these words:</div>
            
            <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', minHeight: '34px', alignItems: 'center', marginBottom:'1rem'}}>
               <AnimatePresence>
                  {step >= 2 && (
                     <motion.div key="badge-pricing" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{background:'rgba(59,130,246,0.2)', color:'#3b82f6', border:'1px solid rgba(59,130,246,0.3)', padding:'0.4rem 1rem', borderRadius:'100px', fontSize:'0.85rem'}}>pricing</motion.div>
                  )}
                  {step >= 4 && (
                     <motion.div key="badge-link" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{background:'rgba(59,130,246,0.2)', color:'#3b82f6', border:'1px solid rgba(59,130,246,0.3)', padding:'0.4rem 1rem', borderRadius:'100px', fontSize:'0.85rem'}}>link</motion.div>
                  )}
               </AnimatePresence>
            </div>

            <div style={{background:'#0a0a0a', border:'1px solid #333', padding:'0.75rem 1rem', borderRadius:'8px', fontSize:'0.9rem', color:'#888', display:'flex', alignItems:'center', height:'45px'}}>
               <Plus size={14} style={{marginRight: '0.5rem'}}/> 
               {step === 1 ? <Typewriter key="tw-pricing" text="pricing" /> : 
                step === 3 ? <Typewriter key="tw-link" text="link" /> : 
                step >= 5 ? <span key="tw-done" style={{opacity:0.5}}>Add keyword...</span> :
                <span key="tw-typing" style={{opacity:0.5}}>Add keyword...<motion.span animate={{opacity:[1,0]}} transition={{repeat:Infinity, duration:0.4}}>|</motion.span></span>}
            </div>
         </div>
         <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
            <motion.div animate={{ color: step >= 5 ? "#10b981" : "#666", x: step >= 5 ? [0, 5, 0] : 0 }} transition={{ repeat: step >= 5 ? Infinity : 0, duration: 1 }}>
               <ArrowRight size={20} color="inherit" />
            </motion.div>
            <motion.div animate={{ borderColor: step >= 5 ? "#10b981" : "#2A2D35" }} style={{background:'#18201D', border:'1px solid #2A2D35', borderRadius:'12px', padding:'1rem', flex:1, display:'flex', alignItems:'center', gap:'1rem', transition: 'border-color 0.5s'}}>
               <motion.div animate={{ scale: step >= 5 ? [1, 1.2, 1] : 1 }} transition={{ repeat: step >= 5 ? Infinity : 0, duration: 2 }}>
                  <Send size={20} color={step >= 5 ? "#10b981" : "#666"} style={{ transition: 'color 0.5s' }} />
               </motion.div>
               <div style={{fontSize:'0.9rem', color: step >= 5 ? '#dedede' : '#888', fontWeight: 600, transition: 'color 0.5s'}}>Send Private Message</div>
            </motion.div>
         </div>
      </div>
   );
};

const UI_Step3 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0);

   useEffect(() => {
       let isActive = true;
       const run = async () => {
          while (isActive) {
             setStep(0);
             await new Promise(r => setTimeout(r, 1000));
             if(!isActive) break;
             setStep(1); // Trigger graph and count up
             await new Promise(r => setTimeout(r, 6000));
          }
       };
       run();
       return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', gap:'1.5rem'}}>
         <div style={{background:'#16181D', border:'1px solid #2A2D35', borderRadius:'16px', padding:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
               <div style={{fontSize:'0.85rem', color:'#888', marginBottom:'0.25rem'}}>Captured Engagement</div>
               <div style={{fontSize:'2.5rem', fontWeight:800, color: step >= 1 ? '#10b981' : '#444', transition: 'color 0.5s'}}>{step >= 1 ? <CountUpMetric target={24500} prefix="+" /> : "0"}</div>
            </div>
            <div style={{width:60, height:45, display:'flex', alignItems:'flex-end', gap:'4px'}}>
               <motion.div animate={{ height: step >= 1 ? '40%' : '10%' }} transition={{ duration: 0.5 }} style={{width:12, background:'#10b981', borderRadius:'4px', opacity:0.3}} />
               <motion.div animate={{ height: step >= 1 ? '60%' : '10%' }} transition={{ duration: 0.5, delay: 0.1 }} style={{width:12, background:'#10b981', borderRadius:'4px', opacity:0.5}} />
               <motion.div animate={{ height: step >= 1 ? '80%' : '10%' }} transition={{ duration: 0.5, delay: 0.2 }} style={{width:12, background:'#10b981', borderRadius:'4px', opacity:0.8}} />
               <motion.div animate={{ height: step >= 1 ? '100%' : '10%' }} transition={{ duration: 0.5, delay: 0.3 }} style={{width:12, background:'#10b981', borderRadius:'4px'}} />
            </div>
         </div>
         
         <div style={{display:'flex', gap:'1rem'}}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: step >= 1 ? 0 : 20, opacity: step >= 1 ? 1 : 0 }} transition={{ delay: 0.4 }} style={{background:'#16181D', border:'1px solid #2A2D35', borderRadius:'100px', padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', flex:1, justifyContent:'center'}}>
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{width:10, height:10, borderRadius:'50%', background:'#3b82f6'}} />
               <div style={{fontSize:'0.95rem', color:'#dedede', fontWeight:600}}>{step >= 1 ? <CountUpMetric target={14.2} suffix="k DMs" decimals={1} /> : "0k DMs"}</div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: step >= 1 ? 0 : 20, opacity: step >= 1 ? 1 : 0 }} transition={{ delay: 0.5 }} style={{background:'#16181D', border:'1px solid #2A2D35', borderRadius:'100px', padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem', flex:1, justifyContent:'center'}}>
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} style={{width:10, height:10, borderRadius:'50%', background:'#10b981'}} />
               <div style={{fontSize:'0.95rem', color:'#dedede', fontWeight:600}}>{step >= 1 ? <CountUpMetric target={12.5} suffix="% CTR" decimals={1} /> : "0% CTR"}</div>
            </motion.div>
         </div>
      </div>
   );
};

const HowItWorksInteractive = () => {
   return (
      <div className={styles.container}>
         <FadeIn><h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '6rem', color: 'var(--text-heading)', textAlign: 'center' }}>How it works</h2></FadeIn>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 1</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, lineHeight: 1.1 }}>Connect securely</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>OAuth directly into Meta's official API node. No passwords required, strictly compliant.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'radial-gradient(ellipse at center, #111 0%, #000 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minHeight: '350px', alignItems: 'center' }}>
                  <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
                     <UI_Step1 />
                  </div>
               </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn delay={0.1}>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 2</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, lineHeight: 1.1 }}>Train the triggers</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>Deploy keywords specific to your newest Reel or Static Post instantly from the dashboard.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'radial-gradient(ellipse at center, #111 0%, #000 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minHeight: '350px', alignItems: 'center' }}>
                  <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
                     <UI_Step2 />
                  </div>
               </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn delay={0.2}>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 3</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, lineHeight: 1.1 }}>Drive engagement & sales</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>AutoDrop routes inbound requests 24/7 capturing core analytics and interactions live in your dashboard.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'radial-gradient(ellipse at center, #111 0%, #000 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minHeight: '350px', alignItems: 'center' }}>
                  <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
                     <UI_Step3 />
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};

const useCases = [
    {
       avatar: 'linear-gradient(45deg, #f09433, #dc2743)',
       handle: '@tech_gadgets',
       postPrefix: 'New desk setup! Comment ',
       trigger: 'DESK',
       postSuffix: ' for the full parts list.',
       dm: 'Sent! 📦 Check out the desk setup parts here: drop.link/desk',
       image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80' // cool desk tech
    },
    {
       avatar: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
       handle: '@finance_coach',
       postPrefix: 'Paying too much tax? Comment ',
       trigger: 'TAX',
       postSuffix: ' to get my free 2026 cheat sheet.',
       dm: 'Here is your cheat sheet! 📄 Download: drop.link/tax-pdf',
       image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80' // finance spreadsheet
    },
    {
       avatar: 'linear-gradient(45deg, #f43f5e, #f97316)',
       handle: '@stylebysarah',
       postPrefix: 'New summer drop! Comment ',
       trigger: 'LINK',
       postSuffix: " to grab it before it sells out.",
       dm: 'Sent the exact links to your DMs! 👗 drop.link/spring',
       image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=600&q=80' // single dress hanging
    },
    {
       avatar: 'linear-gradient(45deg, #10b981, #3b82f6)',
       handle: '@vegan_eats',
       postPrefix: '15-minute healthy pasta! Comment ',
       trigger: 'RECIPE',
       postSuffix: " and I'll DM you the ingredients.",
       dm: 'Here is the recipe! 🥦 Enjoy your pasta: drop.link/pasta',
       image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80' // healthy pasta
    },
    {
       avatar: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
       handle: '@mr_math',
       postPrefix: 'Struggling with calculus? Comment ',
       trigger: 'STUDY',
       postSuffix: " and I'll send my free prep guide.",
       dm: 'Ace that test! 📚 Here is the prep guide: drop.link/calc',
       image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80' // notebooks / study
    }
];

const HeroUseCases = () => {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const int = setInterval(() => {
            setIdx(i => (i + 1) % useCases.length);
        }, 5500); // 5.5 seconds per case (slower)
        return () => clearInterval(int);
    }, []);

    const current = useCases[idx];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Ambient volumetric glow */}
            <div style={{position: 'absolute', width: '90%', height: '90%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0}} />
            
            <AnimatePresence mode="wait">
               <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }} // Slower, smoother fade
                  style={{ width: '380px', background: '#111318', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 1, display: 'flex', flexDirection: 'column' }}
               >
                   {/* IG Post Header Mockup */}
                   <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem'}}>
                      <div style={{width: 44, height: 44, borderRadius: '50%', background: current.avatar, flexShrink: 0}}/>
                      <div>
                         <div style={{fontWeight: 700, fontSize:'1rem', color:'#fff'}}>{current.handle}</div>
                         <div style={{fontSize:'0.75rem', color:'#888'}}>Just now • Instagram</div>
                      </div>
                   </div>

                   {/* IG Post Image Visual */}
                   <div style={{width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', background: '#222'}}>
                      <img src={current.image} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Post preview" />
                   </div>

                   {/* IG Post Caption */}
                   <p style={{color:'#e5e7eb', fontSize:'0.95rem', lineHeight:1.5, marginBottom:'1.5rem'}}>
                      {current.postPrefix}
                      <span style={{color: '#3b82f6', fontWeight:700}}>&apos;{current.trigger}&apos;</span>
                      {current.postSuffix}
                   </p>

                   {/* Simulated Trigger Comment */}
                   <div style={{display:'flex', alignItems:'center', gap:'1rem', padding:'0.75rem', background:'rgba(255,255,255,0.02)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)', marginBottom:'1.5rem'}}>
                      <MessageCircle size={20} color="#888" />
                      <span style={{fontSize:'0.9rem', color:'#888', flex:1}}>Add a comment...</span>
                      <motion.div 
                         initial={{scale: 1}} animate={{scale: [1, 1.05, 1]}} transition={{repeat:Infinity, duration:2.5, repeatDelay: 1}}
                         style={{fontSize:'0.85rem', fontWeight:600, color:'#3b82f6', background:'rgba(59,130,246,0.1)', padding:'0.2rem 0.5rem', borderRadius:'6px'}}
                      >
                         {current.trigger}
                      </motion.div>
                   </div>

                   {/* DM Reply Box popping up */}
                   <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 1, type: 'spring', bounce: 0.3 }} // Pop delayed slower
                      style={{background:'linear-gradient(145deg, #181a20, #0a0a0a)', padding:'1.25rem', borderRadius:'16px', border:'1px solid rgba(16,185,129,0.3)', position:'relative'}}
                   >
                      <div style={{position:'absolute', top:'-8px', right:'-8px', background:'#111318', borderRadius:'50%', padding: '2px'}}>
                         <div style={{background:'#10b981', width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '10px'}}>
                            ✓
                         </div>
                      </div>
                      <div style={{fontSize:'0.75rem', color:'#10b981', fontWeight:700, marginBottom:'0.5rem', letterSpacing:'0.05em', textTransform:'uppercase'}}>DM Instant Reply</div>
                      <div style={{color:'#fff', fontSize:'0.9rem', lineHeight:1.5}}>
                         {current.dm}
                      </div>
                   </motion.div>
               </motion.div>
            </AnimatePresence>
        </div>
    );
};

const faqs = [
  { q: "What is AutoDrop?", a: "AutoDrop is a Meta Business Partner tool that automatically replies to Instagram comments and sends DMs to your audience when they comment a specific trigger word." },
  { q: "Is AutoDrop free to use?", a: "Yes, we offer a generous free tier that lets you test our core automation features. No credit card required." },
  { q: "Why is AutoDrop free? What's the catch?", a: "There is no catch! We offer a free tier so creators can experience the magic. Our premium plans are designed for creators who want advanced automations and priority support." },
  { q: "Is AutoDrop safe to use?", a: "Absolutely. We use the official Meta Instagram Graph API, ensuring 100% compliance with Instagram's terms of service. You will never be shadowbanned for using AutoDrop." },
  { q: "Is AutoDrop compliant with Instagram's Terms of Service?", a: "Yes. Being an official Meta Business Partner, our application undergoes rigorous automated and manual security reviews by Facebook's engineering team." },
  { q: "Do I need a credit card to use AutoDrop for free?", a: "No, you don't need a credit card to start. Our free plan is truly free to help you get started." },
  { q: "How do I sign up for AutoDrop?", a: "Click 'Start Free Trial' or 'Sign In', link your Facebook account that manages your Instagram Professional account, and you're ready to go!" },
  { q: "Can AutoDrop be used on other social media platforms?", a: "Currently, AutoDrop is laser-focused on providing the best possible experience for Instagram. We plan to roll out Facebook Messenger automation soon." },
  { q: "Why do I need to connect my Facebook account to use AutoDrop?", a: "Instagram's official API requires all third-party apps to authenticate via Facebook Business Manager. This is Meta's standard security requirement." },
  { q: "How many DMs can I send with AutoDrop?", a: "You can send completely unlimited DMs! Unlike our competitors that charge you per message, we do not restrict how many automated DMs you can send to your audience, ensuring your viral posts are fully covered." },
  { q: "Can I try AutoDrop for free before committing to a subscription?", a: "Yes! Your account starts on the free tier by default. You only upgrade when you're ready to scale your workflow." },
  { q: "Is AutoDrop an alternative to Link-in-bio services?", a: "Yes! Instead of telling users to 'click the link in my bio' (which lowers algorithmic reach), you tell them to 'Comment DESK' and the link is instantly DM'd to them." },
  { q: "How do I contact customer support if I need help?", a: "You can email us anytime or click the 'Support' link in our footer. Pro users get priority response within 24 hours." },
  { q: "Does AutoDrop need my Instagram password?", a: "Never. We use secure OAuth linking via Meta, meaning AutoDrop will never see or store your actual Instagram password." }
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'transparent', border: 'none', color: 'var(--text-heading)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
      >
        <span>{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} color="var(--text-muted)" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const testimonials = [
  {
    name: "Handmade Crafts",
    handle: "@handmade_craftsandprojects",
    text: "AutoDrop has completely changed how I sell my craft templates. Now when followers ask for project details, the exact links are sent directly to their DMs instantly. I've saved hours of manual replying.",
    avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=150&q=80",
    metrics: "3x More Link Clicks"
  }
];

const TestimonialsSection = () => {
  return (
    <section style={{ padding: '8rem 0', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      
      <div className={styles.container}>
        <FadeIn>
           <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: 'var(--text-heading)', textAlign: 'center' }}>Creator Success</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem auto' }}>See how creators are using AutoDrop to automate their growth and reclaim their time.</p>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {testimonials.map((t, idx) => (
             <FadeIn delay={idx * 0.15} key={idx}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
                   
                   {/* Star Rating */}
                   <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1.5rem' }}>
                      {[1,2,3,4,5].map(star => (
                         <svg key={star} width="20" height="20" viewBox="0 0 24 24" fill="#facc15" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                         </svg>
                      ))}
                   </div>

                   {/* Review Text */}
                   <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.6, flex: 1, marginBottom: '2rem', fontStyle: 'italic' }}>
                      "{t.text}"
                   </p>

                   {/* User Info & Metric Badge */}
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <img src={t.avatar} alt={t.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                         <div>
                            <div style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                            <div style={{ color: '#818cf8', fontSize: '0.85rem' }}>{t.handle}</div>
                         </div>
                      </div>
                      
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                         {t.metrics}
                      </div>
                   </div>
                </div>
             </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};


export default function LandingClient({ userId }: { userId: string | null }) {
  // Cursor tracking & Mobile state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const updateMousePos = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePos);
    return () => window.removeEventListener("mousemove", updateMousePos);
  }, []);

  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <main className={styles.main}>
      {/* Premium Cursor Glow */}
      <motion.div 
        animate={{ x: mousePosition.x - 250, y: mousePosition.y - 250 }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
        style={{
           position: 'fixed', top: 0, left: 0, width: 500, height: 500,
           background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)',
           pointerEvents: 'none', zIndex: 9999, borderRadius: '50%'
        }}
      />

      <div className={styles.navbarWrapper}>
        <nav className={styles.navbar}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" style={{ height: 38, objectFit: 'contain' }} />
              <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ color: '#5b85ff' }}>Auto</span>
                <span style={{ color: '#ffffff' }}>Drop</span>
              </div>
            </div>
          </Link>

          <button className={styles.mobileMenuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
          </button>

          <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
            <a href="#features" className={styles.navLink} onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Features</a>
            <a href="#how-it-works" className={styles.navLink} onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>How it Works</a>
            <Link href="/pricing" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/affiliates" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Partner Program</Link>
            <Link href="/support" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Book a Call</Link>
            {isMobileMenuOpen && (
               <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#9ca3af' }}>
                     <span>Theme:</span>
                     <ThemeToggle />
                  </div>
                  {userId ? (
                     <Link href="/dashboard" className="premium-btn" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem', width: '100%', textAlign: 'center' }}>Dashboard</Link>
                  ) : (
                     <Link href="/sign-in" className="premium-btn" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem', width: '100%', textAlign: 'center' }}>Sign In</Link>
                  )}
               </div>
            )}
          </div>
          <div className={styles.authCol}>
            <ThemeToggle />
            {userId ? (
               <Link href="/dashboard" className="premium-btn" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>Dashboard</Link>
            ) : (
               <Link href="/sign-in" className="premium-btn" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>Sign In</Link>
            )}
          </div>
        </nav>
      </div>

      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={`${styles.heroGrid} ${styles.splitSection}`}>
            <div className={styles.heroContent}>
              <FadeIn delay={0.1}>
                <h1 className={styles.heroHeading} style={{ marginBottom: '1.5rem', width: '100%', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  {USE_NOOB_FRIENDLY_HERO ? (
                    <>
                      Convert Instagram Comments Into <span className="text-gradient" style={{display: 'inline-block'}}>Followers, Leads & Sales</span> Automatically!
                    </>
                  ) : (
                    <>
                      Turn Instagram Comments Into Leads <span className="text-gradient" style={{display: 'inline-block'}}>Automatically</span>
                    </>
                  )}
                </h1>
              </FadeIn>
              
              <div className={styles.mobileOnlyVisual}>
                <HeroMockupElement />
              </div>

              <FadeIn delay={0.2}>
                <p className={styles.heroSub} style={{ maxWidth: '90%', marginBottom: '2rem', lineHeight: 1.6 }}>
                  {USE_NOOB_FRIENDLY_HERO ? (
                    "Stop sending links manually. AutoDrop watches your Reels and posts, replying to comments and sending links to DMs instantly, 24/7."
                  ) : (
                    "Reply to every comment, send DMs instantly, and capture leads while you sleep. Turn your engagement into revenue on autopilot."
                  )}
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className={styles.heroCtas}>
                  {userId ? (
                     <Link href="/dashboard" className="premium-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', whiteSpace: 'nowrap' }}>Dashboard <ArrowRight size={20}/></Link>
                  ) : (
                     <Link href="/sign-up" className="premium-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', whiteSpace: 'nowrap' }}>Start Free Trial <ArrowRight size={20}/></Link>
                  )}
                  <a href="#how-it-works" className={styles.navLink} onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ flex: 1, color: 'var(--text-heading)', fontWeight: 600, padding: '1rem', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', borderRadius: '999px', transition: 'all 0.2s', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>See How it Works</a>
                </div>
              </FadeIn>
              <FadeIn delay={0.35}>
                <div className={styles.metaBadgeBox} style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                   <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Badged Partner</div>
                      <h3 style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>AutoDrop is a Meta Business Partner</h3>
                      <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-muted)', lineHeight: 1.5 }}>Offering peace of mind by ensuring complete compliance with automation standards across Instagram.</p>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)', fontWeight: 600, fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', whiteSpace: 'nowrap' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0, marginRight: '0.25rem'}}>
                         <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" />
                      </svg>
                      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>Meta Business<span style={{fontWeight: 400}}>Partners</span></span>
                   </div>
                </div>
              </FadeIn>
            </div>

            <div className={styles.desktopOnlyVisual}>
               <HeroMockupElement />
            </div>
          </div>
        </div>
      </section>


      {/* Advanced 8-Grid Features Section */}
      <section id="features" style={{ padding: '8rem 0' }}>
        <div className={styles.container}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)' }}>
                {USE_NOOB_FRIENDLY_FEATURES ? "Choose Your Growth Superpowers 🚀" : "Unlock the full Power of Instagram"}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                {USE_NOOB_FRIENDLY_FEATURES 
                  ? "You don't need to be a tech wizard. AutoDrop does the hard work of turning comments and views into followers, leads, and sales on auto-pilot."
                  : "A complete toolkit designed to harvest leads predictably without triggering ban limits."
                }
              </p>
            </div>
          </FadeIn>

          {USE_NOOB_FRIENDLY_FEATURES ? (
            /* NEW HIGH-FIDELITY INSTAGRAM-RESEMBLING FEATURES GRID */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              
              {/* 1. Comment Magnet - Reel Comment Sheet Simulation */}
              <FadeIn delay={0.1}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: 'var(--feature-card-bg)', borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--feature-card-border)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ background: '#121212', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'flex-start', overflow: 'hidden' }}>
                     {/* Instagram Reel Header Mockup */}
                     <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Comments</span>
                        <span style={{ marginLeft: 'auto', background: 'rgba(91,133,255,0.1)', color: '#3897f0', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700 }}>Instagram Reel</span>
                     </div>
                     
                     {/* Simulated Instagram Comment Bubble */}
                     <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#1e1e1e', padding: '0.75rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>sarajohnson</span>
                              <Heart size={12} color="#ff3040" fill="#ff3040" style={{ cursor: 'pointer' }} />
                           </div>
                           <span style={{ fontSize: '0.8rem', color: '#dedede' }}>Drop the link please! 😍</span>
                           <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
                              <span>1m</span><span>Reply</span>
                           </div>
                        </div>
                     </div>

                     {/* Instant Auto-Response Subthread */}
                     <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginLeft: '2rem', marginTop: '0.5rem', background: 'rgba(56, 151, 240, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '12px', borderLeft: '2px solid #3897f0' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                           <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              yourbrand 
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} title="Active" />
                           </span>
                           <p style={{ fontSize: '0.75rem', color: '#3897f0', margin: 0, fontWeight: 600 }}>Sent! Check your DMs 🚀</p>
                        </div>
                     </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                       Auto-Reply to Comments 💬
                     </h3>
                     <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                       No more copy-pasting links in comments! When fans comment a keyword on your Reels or posts, AutoDrop instantly replies and slides into their DMs with your link automatically.
                     </p>
                     <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#3897f0', fontWeight: 700 }}>
                        <Zap size={14} /> Official Meta API Instant Dispatch (0.5s)
                     </div>
                  </div>
                </motion.div>
              </FadeIn>

              {/* 2. Story Reply Booster - Story View UI Simulation */}
              <FadeIn delay={0.2}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: 'var(--feature-card-bg)', borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--feature-card-border)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ background: '#0a0a0a', height: '220px', padding: '0', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                     <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(180deg, #1f1f1f 0%, #0d0d0d 100%)' }}>
                        {/* Story Progress Lines */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '2px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', display: 'flex', gap: '4px' }}>
                           <div style={{ flex: 1, height: '100%', background: '#fff', borderRadius: '2px' }} />
                           <div style={{ flex: 1, height: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                        </div>
                        {/* Story Header */}
                        <div style={{ position: 'absolute', top: '18px', left: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', padding: '1px' }}>
                              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000' }} />
                           </div>
                           <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>yourprofile <span style={{ opacity: 0.6, fontWeight: 400 }}>5m</span></span>
                        </div>
                        
                        {/* Floating Instagram Story Link Sticker */}
                        <div style={{ position: 'absolute', top: '30%', left: '10%', right: '10%', textAlign: 'center' }}>
                           <motion.div 
                              animate={{ scale: [1, 1.03, 1] }} 
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', color: '#000', padding: '0.8rem 1.2rem', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)' }}
                           >
                              <span style={{ fontSize: '0.65rem', color: '#e1306c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>REPLY TO STORY</span>
                              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#000', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                 💬 "GROW" for playbook
                              </span>
                           </motion.div>
                        </div>

                        {/* Bottom Interaction Bar */}
                        <div style={{ position: 'absolute', bottom: '15px', left: '10px', right: '10px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                           <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.5)', borderRadius: '100px', padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#fff' }}>
                              Typing "GROW"...
                           </div>
                           <Heart size={18} color="#fff" />
                           <Send size={18} color="#fff" />
                        </div>
                     </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                       Story Interactive Auto-DMs 📖
                     </h3>
                     <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                       Double Story link conversions! Simply post a Story asking followers to reply with a keyword. AutoDrop automatically reads Story replies and delivers DMs instantly.
                     </p>
                     <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#e1306c', fontWeight: 700 }}>
                        <Sparkles size={14} /> Instantly Boosts Story Engagement & Reach
                     </div>
                  </div>
                </motion.div>
              </FadeIn>

              {/* 3. Inbox Auto-Replies - High Fidelity DM Simulation */}
              <FadeIn delay={0.3}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: 'var(--feature-card-bg)', borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--feature-card-border)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ background: '#121212', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                     {/* DM Chat Header */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Alex Johnson</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#888' }}>Active Now</span>
                     </div>

                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Inbound Message Bubble */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                           <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                           <div style={{ background: '#262626', padding: '0.5rem 0.85rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.8rem', color: '#fff', maxWidth: '75%' }}>
                              Hey! I want the secret code <b>GUIDE</b>
                           </div>
                        </div>
                        
                        {/* Outbound Beautiful IG Gradient DM bubble */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                           <div style={{ background: 'linear-gradient(45deg, #3797f0, #a855f7)', padding: '0.65rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.8rem', color: '#fff', maxWidth: '80%', boxShadow: '0 4px 15px rgba(168,85,247,0.25)' }}>
                              <div>Here is your exclusive link:</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', marginTop: '0.4rem', fontWeight: 700, fontSize: '0.75rem', textAlign: 'center', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                 📘 drop.site/free-guide
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                       Inbox Secret Code Words 📩
                     </h3>
                     <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                       Create secret keywords (like 'VIP', 'OFFER', 'GUIDE') for your bio or offline flyers. When customers DM you that specific word, AutoDrop sends them links instantly.
                     </p>
                     <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#a855f7', fontWeight: 700 }}>
                        <CheckCircle2 size={14} /> Dispatch speed: &lt; 0.5s (official webhook integration)
                     </div>
                  </div>
                </motion.div>
              </FadeIn>

              {/* 4. Follower Booster - Profile Gated Simulation */}
              <FadeIn delay={0.4}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: 'var(--feature-card-bg)', borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--feature-card-border)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ background: '#121212', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                     {/* Instagram Profile Simulation */}
                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', padding: '2px', flexShrink: 0 }}>
                           <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                           <div><div style={{fontSize: '0.8rem', fontWeight: 800, color: '#fff'}}>156</div><div style={{fontSize: '0.6rem', color: '#888'}}>posts</div></div>
                           <div><div style={{fontSize: '0.8rem', fontWeight: 800, color: '#fff'}}>12.4k</div><div style={{fontSize: '0.6rem', color: '#888'}}>followers</div></div>
                           <div><div style={{fontSize: '0.8rem', fontWeight: 800, color: '#fff'}}>420</div><div style={{fontSize: '0.6rem', color: '#888'}}>following</div></div>
                        </div>
                     </div>

                     {/* Pulsing Blue IG Follow Button */}
                     <motion.div 
                        animate={{ scale: [1, 1.02, 1] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ background: '#0095f6', color: '#fff', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', cursor: 'pointer', marginBottom: '0.75rem' }}
                     >
                        Follow
                     </motion.div>

                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.4rem', borderRadius: '8px', fontSize: '0.7rem', color: '#f43f5e', fontWeight: 700 }}>
                        <ShieldCheck size={12} /> Auto-checking follower status...
                     </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                       Follower Booster (Follow-Gate) 🔒
                     </h3>
                     <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                       Turn commenters into followers! AutoDrop automatically checks if a user is following your profile. If they aren't, it politely reminds them to follow you before delivering their link.
                     </p>
                     <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#f43f5e', fontWeight: 700 }}>
                        <ShieldCheck size={14} /> Boosts follower conversion by up to 2.4x
                     </div>
                  </div>
                </motion.div>
              </FadeIn>

              {/* 5. Revive Viral Posts - Reels Grid Simulation */}
              <FadeIn delay={0.5}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: 'var(--feature-card-bg)', borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--feature-card-border)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ background: '#121212', height: '220px', padding: '0.75rem', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     {/* Instagram Profile Post Grid Mockup */}
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', height: '100%' }}>
                        <div style={{ background: 'linear-gradient(135deg, #252830, #141517)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                           <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700 }}>▶ 12k</span>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #252830, #141517)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                           <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700 }}>▶ 84k</span>
                        </div>
                        {/* Highlighted active AutoDrop post */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', border: '1px solid #10b981', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px' }}>
                           <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
                              <RefreshCcw size={16} color="#10b981" />
                           </motion.div>
                           <span style={{ fontSize: '0.5rem', color: '#10b981', fontWeight: 800, marginTop: '4px', textAlign: 'center' }}>▶ 1.2M VIEWS</span>
                           <span style={{ fontSize: '0.45rem', color: '#fff', background: '#10b981', padding: '1px 3px', borderRadius: '3px', marginTop: '2px', fontWeight: 700 }}>ACTIVE</span>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #252830, #141517)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                           <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700 }}>▶ 140k</span>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #252830, #141517)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                           <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700 }}>▶ 6.4k</span>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #252830, #141517)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                           <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700 }}>▶ 95k</span>
                        </div>
                     </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                       Revive Old Viral Reels 🔄
                     </h3>
                     <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                       Maximize old organic traffic! Got an old post that's still getting views or just went viral? Toggle AutoDrop on historical Reels to convert late viewers into fans automatically.
                     </p>
                     <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                        <RefreshCcw size={14} /> Wake up past reels with 1 simple click
                     </div>
                  </div>
                </motion.div>
              </FadeIn>

              {/* 6. Grow Your Email List - In-Chat email capture */}
              <FadeIn delay={0.6}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: 'var(--feature-card-bg)', borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--feature-card-border)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ background: '#121212', height: '220px', padding: '1rem 1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                     
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {/* DM Prompt */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                           <div style={{ background: 'linear-gradient(45deg, #3797f0, #a855f7)', padding: '0.45rem 0.85rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.75rem', color: '#fff', maxWidth: '85%' }}>
                              Where should I send the code? Reply with your Email! 📬
                           </div>
                        </div>

                        {/* Customer Email Reply */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                           <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                           <div style={{ background: '#262626', padding: '0.45rem 0.85rem', borderRadius: '16px 16px 16px 4px', fontSize: '0.75rem', color: '#fff', maxWidth: '85%' }}>
                              <b>alex@gmail.com</b>
                           </div>
                        </div>

                        {/* Automated email saving card */}
                        <motion.div 
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                        >
                           <CheckCircle2 size={14} color="#10b981" />
                           <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Saved & synced to Klaviyo / Mailchimp!</span>
                        </motion.div>
                     </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                       Grow Your Email List 📧
                     </h3>
                     <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                       Forget slow, clunky web landing pages. Collect your customer's email directly inside the Instagram DM chat and automatically sync it straight to your email lists.
                     </p>
                     <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 700 }}>
                        <AtSign size={14} /> 10x higher opt-in conversion rates than web pages
                     </div>
                  </div>
                </motion.div>
              </FadeIn>

              {/* 7. Custom AI Sales Agent - Organic typing simulation */}
              <FadeIn delay={0.7}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: 'var(--feature-card-bg)', borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--feature-card-border)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ background: '#121212', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Customer Question */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                           <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                           <div style={{ background: '#262626', padding: '0.45rem 0.85rem', borderRadius: '16px 16px 16px 4px', fontSize: '0.75rem', color: '#fff' }}>
                              Is the guide beginner friendly?
                           </div>
                        </div>

                        {/* AI Reply */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                           <div style={{ background: 'linear-gradient(45deg, #3797f0, #a855f7)', padding: '0.55rem 0.95rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.75rem', color: '#fff', maxWidth: '85%' }}>
                              Yes! It starts from absolute scratch. Here's a 10% coupon: <b>NOOB10</b> 🎁
                           </div>
                        </div>

                        {/* Custom typing state */}
                        <div style={{ display: 'flex', gap: '0.3rem', padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', width: '50px', justifyContent: 'center' }}>
                           <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />
                           <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />
                           <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />
                        </div>
                     </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                       Custom AI Sales Agent 🤖 <span style={{ color: '#facc15', fontSize: '0.7rem', verticalAlign: 'middle', border:'1px solid #facc15', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Coming Soon</span>
                     </h3>
                     <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                       Train an ultra-smart AI bot on your business files or FAQs. It chats organically with your customers, answers product questions, and overcomes purchase objections naturally 24/7.
                     </p>
                     <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#a855f7', fontWeight: 700 }}>
                        <Sparkles size={14} /> Natural language sales conversational flows
                     </div>
                  </div>
                </motion.div>
              </FadeIn>

              {/* 8. Sleek Digital Store - Checkout overlay */}
              <FadeIn delay={0.8}>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ background: 'var(--feature-card-bg)', borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--feature-card-border)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
                  <div style={{ background: '#121212', height: '220px', padding: '1rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                     
                     {/* Digital Store checkout popup */}
                     <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                           <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #ff3f70, #a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.6rem', textAlign: 'center' }}>PDF</div>
                           <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>Viral Reels Playbook</div>
                              <div style={{ fontSize: '0.65rem', color: '#888' }}>Instant PDF Download</div>
                           </div>
                           <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>$27.00</div>
                           </div>
                        </div>

                        {/* Interactive Checkout CTA */}
                        <div style={{ background: '#fff', color: '#000', padding: '0.45rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                           <span>Pay with UPI/Card/Apple Pay</span>
                        </div>
                        <div style={{ fontSize: '0.55rem', color: '#888', textAlign: 'center' }}>
                           🔒 Secured by Stripe. Standard Instagram Browser Sheet
                        </div>
                      </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                       Sleek Digital Store 🛍️ <span style={{ color: '#10b981', fontSize: '0.7rem', verticalAlign: 'middle', border:'1px solid #10b981', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Included</span>
                     </h3>
                     <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                       No external website or Shopify account needed. Simply upload your PDF guides, masterclasses, or ebooks to your AutoDrop dashboard, and sell directly inside DMs.
                     </p>
                     <div style={{ marginTop: 'auto', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#22d3ee', fontWeight: 700 }}>
                        <ShoppingBag size={14} /> Full Stripe & Payment Gateway integrations included
                     </div>
                  </div>
                </motion.div>
              </FadeIn>

            </div>
          ) : (
            /* ORIGINAL FEATURES SECTION */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
               
               {/* 1. Comment Automation */}
               <FadeIn delay={0.1}>
                 <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ background: '#fff', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #efefef' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                         <MessageCircle size={16} color="#000" /><span style={{fontSize: '0.85rem', fontWeight: 700, color: '#000'}}>Comments</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                         <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover' }} />
                         <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000', marginRight: '0.4rem' }}>sarajohnson</span>
                            <span style={{ fontSize: '0.85rem', color: '#000' }}>Drop the link! 😍</span>
                            <div style={{ fontSize: '0.75rem', color: '#8e8e8e', marginTop: '0.2rem', display: 'flex', gap: '1rem' }}>
                               <span>2w</span><span style={{fontWeight: 600}}>Reply</span>
                            </div>
                         </div>
                         <Heart size={12} color="#8e8e8e" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginLeft: '2.5rem', marginTop: '1rem' }}>
                         <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f43f5e, #f97316)' }} />
                         <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000', marginRight: '0.4rem' }}>autodrop</span>
                            <span style={{ fontSize: '0.8rem', color: '#000' }}>Just sent the link to your DMs! 🚀</span>
                         </div>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Comment Automation</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Automatically reply to post & reel comments and send a DM to capture leads instantly.</p>
                   </div>
                 </motion.div>
               </FadeIn>

               {/* 2. Story Automation */}
               <FadeIn delay={0.2}>
                 <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ background: '#0a0a0a', height: '220px', padding: '0', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'relative', width: '100%', height: '100%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover' }}>
                         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                            <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}><div style={{ width: '50%', height: '100%', background: '#fff', borderRadius: '2px' }}/></div>
                         </div>
                         <div style={{ position: 'absolute', top: '15px', left: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f43f5e, #f97316)' }} />
                            <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>autodrop <span style={{opacity: 0.8, fontWeight: 400}}>3h</span></span>
                         </div>
                         <div style={{ position: 'absolute', top: '35%', width: '100%', textAlign: 'center' }}>
                            <span style={{ background: '#fff', color: '#000', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 800 }}>Reply with "PARTY" 🎉</span>
                         </div>
                         <div style={{ position: 'absolute', bottom: '15px', left: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.5)', borderRadius: '100px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}>
                               <span style={{ fontSize: '0.75rem', color: '#fff' }}>Send message</span>
                            </div>
                            <Heart size={20} color="#fff" />
                            <Send size={20} color="#fff" />
                         </div>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Story Automation</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Trigger specific DMs based on keywords or exact emoji reactions on your Stories.</p>
                   </div>
                 </motion.div>
               </FadeIn>

               {/* 4. DM Check */}
               <FadeIn delay={0.4}>
                 <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                            <div style={{ background: '#efefef', padding: '0.6rem 1rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.85rem', color: '#000', maxWidth: '80%' }}>Hey! I&apos;m interested in the course.</div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                            <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>Awesome! Here is the exclusive link to sign up 🚀</div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '100px', padding: '0.5rem 1rem', marginTop: 'auto' }}>
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Message...</span>
                         </div>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>DM Keyword Triggers</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Automatically reply to users who natively DM you specific keywords or questions.</p>
                   </div>
                 </motion.div>
               </FadeIn>

               {/* 5. Ask For Follow */}
               <FadeIn delay={0.5}>
                 <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                            <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>Please follow us to unlock the link!</div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <div style={{ background: '#efefef', padding: '0.6rem 1rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.85rem', color: '#000', maxWidth: '80%' }}>Followed you!</div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                            <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>Thanks! Here is your download. 👇<div style={{background:'rgba(255,255,255,0.2)', padding:'0.4rem', borderRadius:'6px', marginTop:'0.5rem', fontWeight:600, textAlign: 'center'}}>Download Now</div></div>
                         </div>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Follow-Gates</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Verify if the user is following your profile before dispatching the link automation.</p>
                   </div>
                 </motion.div>
               </FadeIn>

               {/* 6. Re-trigger */}
               <FadeIn delay={0.6}>
                 <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ background: '#fff', height: '220px', padding: '0', position: 'relative', overflow: 'hidden' }}>
                      <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80" alt="Viral post" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(55, 151, 240, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                         <RefreshCcw size={48} color="#fff" />
                         <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>Reactivate Viral Posts</div>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Historically Re-Trigger</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Run automations on posts published months ago to revive dead traffic streams.</p>
                   </div>
                 </motion.div>
               </FadeIn>

               {/* 7. Collect User Data */}
               <FadeIn delay={0.7}>
                 <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                            <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>What is the best email to send this to?</div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                            <div style={{ background: '#efefef', padding: '0.6rem 1rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.85rem', color: '#000', maxWidth: '80%' }}>user@gmail.com</div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                            <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>Sent! Check your inbox. 📥</div>
                         </div>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Data Capture</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Seamlessly build your external email lists directly inside the IG DM ecosystem.</p>
                   </div>
                 </motion.div>
               </FadeIn>

               {/* 8. AI Replies Coming Soon */}
               <FadeIn delay={0.8}>
                 <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ background: '#0a0a0a', height: '220px', padding: '1.5rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      
                      {/* Glowing dynamic background */}
                      <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(168,85,247,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }} />

                      <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                         <Sparkles size={48} color="#a855f7" />
                         <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Autodrop <span style={{ color: '#a855f7' }}>AI</span></span>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Custom Trained AI <span style={{ color: '#facc15', fontSize: '0.7rem', verticalAlign: 'middle', border:'1px solid #facc15', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Coming Soon</span></h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Train an AI model on your store data to contextually answer queries and close sales.</p>
                   </div>
                 </motion.div>
               </FadeIn>

               {/* 9. Creator Marketplace */}
               <FadeIn delay={0.9}>
                 <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ background: '#0a0a0a', height: '220px', padding: '1.5rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      
                      {/* Glowing dynamic background */}
                      <div style={{ position: 'absolute', width: '120px', height: '120px', background: 'radial-gradient(circle at center, rgba(34,211,238,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }} />

                      <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                         <ShoppingBag size={48} color="#22D3EE" />
                         <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Digital <span style={{ color: '#22D3EE' }}>Store</span></span>
                      </div>
                   </div>
                   <div style={{ padding: '1.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Creator Marketplace <span style={{ color: '#10b981', fontSize: '0.7rem', verticalAlign: 'middle', border:'1px solid #10b981', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Included</span></h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Host and sell your digital products directly to your audience without leaving the ecosystem.</p>
                   </div>
                 </motion.div>
               </FadeIn>

            </div>
          )}
        </div>
      </section>


      {/* Sticky Section Trick for How it works */}
      <section id="how-it-works" style={{ padding: '8rem 0', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
         <HowItWorksInteractive />
      </section>

      <TestimonialsSection />

      {/* FAQ SECTION */}
      <section style={{ padding: '8rem 0', background: 'transparent', borderTop: '1px solid var(--border)' }}>
        <div className={styles.container} style={{ maxWidth: '800px' }}>
          <FadeIn>
             <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: 'var(--text-heading)', textAlign: 'center' }}>Frequently Asked Questions</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem', textAlign: 'center' }}>Everything you need to know about the product and billing.</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {faqs.map((faq, idx) => (
                 <FAQItem key={idx} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section style={{ padding: '10rem 0', textAlign: 'center' }}>
        <div className={styles.container}>
          <FadeIn>
             <h2 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>Ready to Scale?</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>Join the 10,000+ creators literally saving 15 hours a week manually answering DMs.</p>
             {userId ? (
                <Link href="/dashboard" className="premium-btn" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>Dashboard</Link>
             ) : (
                <Link href="/sign-up" className="premium-btn" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>Start Free Trial</Link>
             )}
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '3rem 0 1.5rem', background: '#000000' }}>
        <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          {/* Logo + Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" style={{ height: 48, objectFit: 'contain' }} />
              <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ color: '#5b85ff' }}>Auto</span>
                <span style={{ color: '#ffffff' }}>Drop</span>
              </div>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', opacity: 0.7 }}>Instagram DM Automation, Simplified.</p>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '2rem', color: '#9ca3af', fontSize: '0.9rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</Link>
            <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/affiliates" style={{ color: 'inherit', textDecoration: 'none' }}>Partner Program</Link>
            <a href="mailto:support@autodrop.in" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</a>
            <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/refund-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Refund Policy</Link>
          </div>

          {/* Gradient Divider */}
          <div style={{ width: '100%', maxWidth: '400px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

          {/* Copyright + Small Text */}
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.6 }}>
            <p>&copy; {new Date().getFullYear()} Autodrop. All rights reserved.</p>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#9ca3af' }}>
               <ShieldCheck size={14} color="#10b981" /> Official Meta Business Partner
            </p>
          </div>
        </div>

        {/* GIANT BACKGROUND WATERMARK */}
        <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'clip', overflowY: 'hidden', display: 'flex', justifyContent: 'center', marginTop: '2rem', pointerEvents: 'none', userSelect: 'none' }}>
          <span style={{ fontSize: 'clamp(3rem, 15vw, 300px)', fontWeight: 900, lineHeight: 0.75, letterSpacing: '-0.06em', background: 'linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Autodrop
          </span>
        </div>
      </footer>
    </main>
  );
}
